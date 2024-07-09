import praw
import praw.models
import pandas as pd
import json
import os
import logging
from typing import List, Dict, Any

logging.basicConfig(level=logging.ERROR, format='%(asctime)s - %(levelname)s - %(message)s')


class RedditCrawler:
    """
    A class to fetch data from Reddit using PRAW (Python Reddit API Wrapper).
    """

    def __init__(self, api_keys_path: str):
        """
        Initializes the RedditCrawler instance with Reddit API credentials from a JSON file.

        :param api_keys_path: Path to the JSON file containing Reddit API credentials.
        """
        current_dir = os.path.dirname(os.path.realpath(__file__))
        api_keys = json.loads(open(os.path.join(current_dir, api_keys_path)).read())
        self.reddit = praw.Reddit(
            client_id=api_keys["client_id"],
            client_secret=api_keys["client_secret"],
            user_agent="jji-bigg"
        )
        self.subreddit = None
        self.search = None
        self.search_term = None

    def set_reddit_params(self, subreddit_name: str, search_term: str, limit: int) -> None:
        """
        Sets the subreddit and search parameters for Reddit scraping.

        :param subreddit_name: Name of the subreddit to crawl.
        :param search_term: Search term to filter submissions.
        :param limit: Maximum number of submissions to fetch.
        """
        self.subreddit = self.reddit.subreddit(subreddit_name)
        self.search_term = search_term
        self.search = self.subreddit.search(self.search_term, limit=limit)

    def fetch_subreddit_data(self, subreddit_name: str, search_term: str, limit: int) -> List[
        Dict[str, Any]]:
        """
        Fetches data from Reddit for a given subreddit and search term.

        :param subreddit_name: Name of the subreddit to crawl.
        :param search_term: Search term to filter submissions.
        :param limit: Maximum number of submissions to fetch.
        :return: List of dictionaries containing submission and comment details.
        """
        self.set_reddit_params(subreddit_name, search_term, limit)
        data_list = []
        for submission in self.search:
            try:
                submission_data = {
                    "subreddit": subreddit_name,
                    "title": submission.title,
                    "url": submission.url,
                    "author": submission.author.name if submission.author else None,
                    "score": submission.score,
                    "num_comments": submission.num_comments,
                    "created_utc": submission.created_utc,
                    "selftext": submission.selftext,
                    "permalink": submission.permalink,
                }
                comments_df = self.fetch_comments(submission)
                submission_data["comments"] = comments_df.to_dict(orient="records")
                data_list.append(submission_data)
            except Exception as e:
                logging.error(f"Error processing submission {submission.id}: {e}")
                continue
        return data_list

    def fetch_comments(self, submission: praw.models.Submission) -> pd.DataFrame:
        """
        Fetches comments for a given Reddit submission.

        :param submission: Reddit submission object.
        :return: DataFrame containing comment details.
        """
        comments_df = pd.DataFrame(
            columns=[
                "body",
                "score",
                "username",
                "user_id",
                "created_utc",
                "permalink",
                "subreddit",
                "parent_id",
            ]
        )

        for comment in submission.comments.list():
            try:
                if isinstance(comment, praw.models.MoreComments):
                    continue

                if comment.author is None:
                    user_id = "[deleted]"
                    username = "[deleted]"
                elif hasattr(comment.author, "is_suspended") and comment.author.is_suspended:
                    user_id = "[suspended]"
                    username = "[suspended]"
                else:
                    user_id = comment.author.id
                    username = comment.author.name

                comments_df.loc[len(comments_df)] = [
                    comment.body,
                    comment.score,
                    username,
                    user_id,
                    comment.created_utc,
                    comment.permalink,
                    submission.subreddit.display_name,
                    comment.parent_id,
                ]
            except Exception as e:
                logging.error(f"Error processing comment {comment.id}: {e}")
                continue

        comments_df.sort_values(by="score", ascending=False, inplace=True)
        return comments_df

    def generate_csv_for_subreddit(self, subreddit_name: str, search_term: str, limit: int,
                                   file_name: str = None, append=False) -> None:
        """
        Generates or appends to a CSV file for Reddit data based on the given subreddit, search term, and limit.

        :param subreddit_name: Name of the subreddit to crawl.
        :param search_term: Search term to filter submissions.
        :param limit: Maximum number of submissions to fetch.
        :param file_name: File name to save or append the CSV file. If None, generates a default name.
        :param append: Whether to append to an existing CSV file or create a new one.
        """

        file_name = file_name or f"reddit_data_{subreddit_name}_{search_term}.csv"
        mode = 'a' if append else 'w'
        header = not (os.path.exists(file_name) and not append)
        if header:
            data = self.fetch_subreddit_data(subreddit_name, search_term, limit)
            pd.DataFrame(data).to_csv(file_name, mode=mode, header=header, index=False)
            logging.info(f"Generated CSV file: {file_name}")
        else:
            logging.warning(f"File {file_name} already exists. Skipping generation.")



if __name__ == "__main__":
    # Test usages
    reddit_crawler = RedditCrawler("reddit_key.json")
    subreddit_name = "cornell"
    search_term = "finals"
    limit = 5
    reddit_crawler.generate_csv_for_subreddit(subreddit_name, search_term, limit)
