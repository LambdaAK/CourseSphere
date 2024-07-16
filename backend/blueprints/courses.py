from flask import Blueprint

from backend.db import execute_query
from backend.endpoints import error_response, success_response

courses_bp = Blueprint("courses", __name__)


# Add your routes and other blueprint-related code here
@courses_bp.route("/courses", methods=["GET"])
def get_courses():
    """
    Retrieves a list of all courses from the database.

    :return: A JSON response with the list of courses and a 200 status code.
    """
    courses = execute_query("SELECT * FROM courses")
    return success_response(courses, 200)


@courses_bp.route("/courses/<int:course_id>", methods=["GET"])
def get_course(course_id):
    """
    Retrieves a specific course by its ID from the database.

    :param course_id: The ID of the course to retrieve.
    :return: A JSON response with the course data and a 200 status code.
             If the course is not found, returns a 404 status code.
    """
    course = execute_query(f"SELECT * FROM courses WHERE id = {course_id}").fetchall()
    if course:
        return success_response(course, 200)
    else:
        return error_response("Course not found", 404)


@courses_bp.route("/courses/description/<int:course_id>", methods=["GET"])
def get_course_description(course_id):
    """
    Retrieves the description of a specific course by its ID from the database.

    :param course_id: The ID of the course to retrieve.
    :return: A JSON response with the course description and a 200 status code.
             If the course is not found, returns a 404 status code.
    """
    course = execute_query(
        f"SELECT description FROM course_descriptions WHERE id = {course_id}"
    ).fetchall()
    if course:
        return success_response(course, 200)
    else:
        return error_response("Course not found", 404)


@courses_bp.route("/courses/bysection/<int:section_id>", methods=["GET"])
def get_courses_by_section(section_id):
    """
    Retrieves a list of courses for a specific section from the database.

    :param section_id: The ID of the section for which to retrieve courses.
    :return: A JSON response with the list of courses and a 200 status code.
    """
    courses = execute_query(
        f"SELECT * FROM courses WHERE section_id = {section_id}"
    ).fetchall()
    if not courses:
        return error_response("No courses found for this section", 404)
    return success_response(courses, 200)


@courses_bp.route("/courses/<string:semester>", methods=["GET"])
def get_courses_by_semester(semester):
    """
    Retrieves a list of courses for a specific semester from the database.

    :param semester: The semester for which to retrieve courses.
    :return: A JSON response with the list of courses and a 200 status code.
    """
    courses = execute_query(
        f"SELECT * FROM courses WHERE semester = '{semester}'"
    ).fetchall()
    if not courses:
        return error_response("No courses found for this semester", 404)
    return success_response(courses, 200)


@courses_bp.route("/courses/<string:department>", methods=["GET"])
def get_courses_by_department(department):
    """
    Retrieves a list of courses for a specific department from the database.

    :param department: The department for which to retrieve courses.
    :return: A JSON response with the list of courses and a 200 status code.
    """
    courses = execute_query(
        f"SELECT * FROM courses WHERE department = '{department}'"
    ).fetchall()
    if not courses:
        return error_response("No courses found for this department", 404)
    return success_response(courses, 200)


@courses_bp.route("/courses/<string:instructor>", methods=["GET"])
def get_courses_by_instructor(instructor):
    """
    Retrieves a list of courses for a specific instructor from the database.

    :param instructor: The instructor for which to retrieve courses.
    :return: A JSON response with the list of courses and a 200 status code.
    """
    courses = execute_query(
        f"SELECT * FROM courses WHERE instructor = '{instructor}'"
    ).fetchall()
    if not courses:
        return error_response("No courses found for this instructor", 404)
    return success_response(courses, 200)
