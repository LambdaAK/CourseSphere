import sqlite3


def create_connection():
    return sqlite3.connect("cournell-course-sphere-data/roster_reviews.sqlite.db")


def execute_query(query):
    conn = create_connection()
    cursor = conn.cursor()
    res = cursor.execute(query)
    conn.commit()
    conn.close()
    return res
