import os
import sqlite3
import csv
from concurrent.futures import ThreadPoolExecutor
from typing import Optional
import time
import threading
import pandas as pd

def connect_to_database(db_name: str) -> tuple:
    """
    Connect to the SQLite database and create tables if they do not exist.

    :param db_name: Name of the SQLite database file.
    :return: A tuple containing the connection and cursor objects.
    """
    if not os.path.exists(db_name):
        print(f"Database file '{db_name}' does not exist. Creating a new database.")
    conn: sqlite3.Connection = sqlite3.connect(db_name)
    cursor: sqlite3.Cursor = conn.cursor()
    return conn, cursor

def fetch_data(cursor: sqlite3.Cursor) -> list:
    """
    Fetch all distinct course names from the database.

    :param cursor: SQLite cursor object.
    :return: List of all course names.
    """
    cursor.execute("SELECT DISTINCT name FROM courses")
    return cursor.fetchall()

def process_data_segment(data, start, end, file_name, lock, delimiter):
    """
    Process a segment of the data and write it to the CSV file.

    :param data: The entire dataset.
    :param start: The start index for the segment.
    :param end: The end index for the segment.
    :param file_name: The name of the CSV file.
    :param lock: Lock to synchronize write access to the file.
    :param delimiter: The delimiter to use in the CSV file.
    """
    # Convert the segment of data to a pandas DataFrame
    df_segment = pd.DataFrame(data[start:end])
    with lock:
        df_segment.to_csv(file_name + '.csv', mode='a', header=False, index=False, sep=delimiter)

def main(db_name: str, file_name: str, isGathering: bool, parallel: bool = False, comma_delimited: bool = True) -> None:
    """
    Main function to gather data from the database, generate CSV, and move files.

    :param db_name: Name of the SQLite database file.
    :param file_name: Base name of the CSV file.
    :param isGathering: Flag to indicate whether to gather data from the database.
    :param parallel: Flag to indicate whether to run in parallel mode.
    :param comma_delimited: Flag to indicate whether the output should be comma-delimited.
    """
    if isGathering:
        try:
            conn, cursor = connect_to_database(db_name)
            data = fetch_data(cursor)
            N = len(data)
            lock = threading.Lock()
            delimiter = ',' if comma_delimited else ' '
            if parallel:
                num_threads = 2
                segment_size = N // num_threads
                executor = ThreadPoolExecutor(max_workers=num_threads)
                futures = []
                start_time = time.time()
                for i in range(num_threads):
                    start = i * segment_size
                    end = (i + 1) * segment_size if i < num_threads - 1 else N
                    futures.append(executor.submit(process_data_segment, data, start, end, file_name, lock, delimiter))
                for future in futures:
                    future.result()
                end_time = time.time()
                print(f"Parallel execution time: {end_time - start_time:.2f} seconds")
            else:
                start_time = time.time()
                process_data_segment(data, 0, N, file_name, lock, delimiter)
                end_time = time.time()
                print(f"Sequential execution time: {end_time - start_time:.2f} seconds")
            conn.close()
            print(f"CSV generation completed successfully. Data written to {file_name}.csv")
        except Exception as e:
            print(f"An error occurred: {str(e)}")

if __name__ == "__main__":
    main('roster_reviews.sqlite.db', 'course_data', True, parallel=False, comma_delimited=True)
