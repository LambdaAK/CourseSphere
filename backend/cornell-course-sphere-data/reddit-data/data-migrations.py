import dataclasses
import sqlite3
import pandas as pd
import os
import time
from typing import Optional, List, Dict, Any
from reddit_crawler import RedditCrawler


@dataclasses.dataclass
class RedditComment:
    comment_id: Optional[int] = None
    post_id: Optional[int] = None
    subreddit: Optional[str] = None
    username: Optional[str] = None
    user_id: Optional[str] = None
    parent_id: Optional[str] = None
    score: Optional[int] = None
    created_utc: Optional[int] = None
    body: Optional[str] = None
    permalink: Optional[str] = None


@dataclasses.dataclass
class RedditPost:
    post_id: Optional[int] = None
    subreddit: Optional[str] = None
    title: Optional[str] = None
    url: Optional[str] = None
    author: Optional[str] = None
    score: Optional[int] = None
    num_comments: Optional[int] = None
    created_utc: Optional[int] = None
    selftext: Optional[str] = None
    permalink: Optional[str] = None
    comments: Optional[List[RedditComment]] = None  # List of RedditComment objects


class DataMigrations:
    """
    A class representing a database manager for Reddit data migration.
    """

    def __init__(self, db_name: str, api_keys_path: Optional[str] = None):
        """
        Initialize the DataMigrations with the database name and optional API keys path.

        :param db_name: The name of the database file.
        :param api_keys_path: Path to the Reddit API keys file.
        """
        self.db_name = db_name
        self.conn = None
        self.cursor = None
        self.table_names = {
            'posts': 'reddit_posts',
            'comments': 'reddit_comments'
        }
        self.connect_to_database()
        if api_keys_path:
            self.reddit_crawler = RedditCrawler(api_keys_path)

    def connect_to_database(self) -> None:
        """
        Connect to the SQLite database and create tables if they do not exist.
        """
        if not os.path.exists(self.db_name):
            print(f"Database file '{self.db_name}' does not exist. Creating a new database.")
        self.conn = sqlite3.connect(self.db_name)
        self.cursor = self.conn.cursor()
        self.create_tables()

    def create_tables(self) -> None:
        """
        Create the database tables if they do not exist.
        """
        create_posts_sql = """
        CREATE TABLE IF NOT EXISTS reddit_posts (
            post_id INTEGER PRIMARY KEY AUTOINCREMENT,
            subreddit TEXT,
            title TEXT,
            url TEXT,
            author TEXT,
            score INTEGER,
            num_comments INTEGER,
            created_utc INTEGER,
            selftext TEXT,
            permalink TEXT,
            ts TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """

        create_comments_sql = """
        CREATE TABLE IF NOT EXISTS reddit_comments (
            comment_id INTEGER PRIMARY KEY AUTOINCREMENT,
            post_id INTEGER,
            subreddit TEXT,
            username TEXT,
            user_id TEXT,
            parent_id TEXT,
            score INTEGER,
            created_utc INTEGER,
            body TEXT,
            permalink TEXT,
            ts TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

            FOREIGN KEY (post_id) REFERENCES reddit_posts(post_id)
        );
        """
        self.cursor.execute(create_posts_sql)
        self.cursor.execute(create_comments_sql)
        self.conn.commit()

    def close(self) -> None:
        """
        Close the database connection.
        """
        self.conn.close()

    def drop_tables(self) -> None:
        """
        Drops the reddit_posts and reddit_comments tables if they exist.
        """
        drop_posts_sql = f"DROP TABLE IF EXISTS {self.table_names['posts']};"
        drop_comments_sql = f"DROP TABLE IF EXISTS {self.table_names['comments']};"
        self.cursor.execute(drop_posts_sql)
        self.cursor.execute(drop_comments_sql)
        self.conn.commit()

    def populate_database(self, subreddit_name: str, search_term: str = None,
                          limit: int = 10) -> None:
        """
        Populate the database with data from the specified subreddit and search term.

        :param subreddit_name: The name of the subreddit to scrape.
        :param search_term: The search term to be performed when scraping.
        :param limit: Limit of data scrape.
        """
        start_time = time.time()  # Start timing
        posts_count, comment_count = 0, 0

        if search_term is None:
            search_term = self.reddit_crawler.search_term
        self.reddit_crawler.set_reddit_params(subreddit_name, search_term, limit)
        submissions = self.reddit_crawler.fetch_subreddit_data(subreddit_name, search_term, limit)

        for post_data in submissions:
            if not self.post_exists(post_data["url"]):
                post = RedditPost(**post_data)
                post_id = self.insert_post(post)
                posts_count += 1
                for comment_data in post_data["comments"]:
                    comment = RedditComment(post_id=post_id, **comment_data)
                    self.insert_comment(comment)
                    comment_count += 1

        print(posts_count, comment_count)
        end_time = time.time()  # End timing
        duration = end_time - start_time
        print(f"Populating database took with {posts_count} posts "
              f"and {comment_count} comments took {duration:.2f} seconds.")

    def post_exists(self, post_url: str) -> bool:
        """
        Check if a post already exists in the database.

        :param post_url: The URL of the post to check.
        :return: True if the post exists, False otherwise.
        """
        query = f"SELECT EXISTS(SELECT 1 FROM {self.table_names['posts']} WHERE url = ?)"
        self.cursor.execute(query, (post_url,))
        return self.cursor.fetchone()[0] == 1

    def insert_post(self, post: RedditPost) -> int:
        """
        Insert a Reddit post into the database.

        :param post: RedditPost object containing post data.
        :return: The ID of the inserted post.
        """
        insert_sql = f"""
        INSERT INTO {self.table_names['posts']} (subreddit, title, url, author, score, num_comments, created_utc, selftext, permalink)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """
        self.cursor.execute(insert_sql, (
            post.subreddit, post.title, post.url, post.author, post.score, post.num_comments,
            post.created_utc, post.selftext, post.permalink))
        self.conn.commit()
        return self.cursor.lastrowid

    def insert_comment(self, comment: RedditComment) -> None:
        """
        Insert a Reddit comment into the database.

        :param comment: RedditComment object containing comment data.
        """
        insert_sql = f"""
        INSERT INTO {self.table_names['comments']} (post_id, subreddit, username, user_id, parent_id, score, created_utc, body, permalink)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """
        self.cursor.execute(insert_sql, (
            comment.post_id, comment.subreddit, comment.username, comment.user_id,
            comment.parent_id,
            comment.score, comment.created_utc, comment.body, comment.permalink))
        self.conn.commit()

    def read_posts(self) -> pd.DataFrame:
        """
        Read all Reddit posts from the database.

        :return: A DataFrame containing all Reddit posts.
        """
        read_sql = f"SELECT * FROM {self.table_names['posts']}"
        return pd.read_sql_query(read_sql, self.conn)

    def read_comments(self) -> pd.DataFrame:
        """
        Read all Reddit comments from the database.

        :return: A DataFrame containing all Reddit comments.
        """
        read_sql = f"SELECT * FROM {self.table_names['comments']}"
        return pd.read_sql_query(read_sql, self.conn)

    def update_post(self, post_id: int, **kwargs: Any) -> None:
        """
        Update a Reddit post in the database.

        :param post_id: The ID of the post to update.
        :param kwargs: The fields to update.
        """
        # Delete associated comments first
        delete_comments_sql = f"DELETE FROM {self.table_names['comments']} WHERE post_id = ?"
        self.cursor.execute(delete_comments_sql, (post_id,))

        # Update the post
        fields = ', '.join([f"{k} = ?" for k in kwargs.keys()])
        values = list(kwargs.values())
        values.append(post_id)
        update_sql = f"UPDATE {self.table_names['posts']} SET {fields} WHERE post_id = ?"
        self.cursor.execute(update_sql, values)
        self.conn.commit()

    def delete_post(self, post_id: int) -> None:
        """
        Delete a Reddit post from the database and all associated comments.

        :param post_id: The ID of the post to delete.
        """
        # Delete associated comments first
        delete_comments_sql = f"DELETE FROM {self.table_names['comments']} WHERE post_id = ?"
        self.cursor.execute(delete_comments_sql, (post_id,))

        # Delete the post
        delete_post_sql = f"DELETE FROM {self.table_names['posts']} WHERE post_id = ?"
        self.cursor.execute(delete_post_sql, (post_id,))
        self.conn.commit()


if __name__ == "__main__":
    db_name = "reddit_data.db"
    api_keys_path = "reddit_key.json"

    dm = DataMigrations(db_name, api_keys_path)
    test_params = ['cs 1110,' 'math 1110', 'cs 4320', 'econ 1110']
    for s in test_params:
        print("getting data for " + s)
        dm.populate_database('cornell', s, 10)
        time.sleep(15)

    print("\nReading Reddit posts from the database:")
    posts_df = dm.read_posts()
    print(posts_df)

    print("\nReading Reddit comments from the database:")
    comments_df = dm.read_comments()
    print(comments_df)
    dm.close()
