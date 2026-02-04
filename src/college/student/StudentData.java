package college.student;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;

import javax.swing.JOptionPane;

import college.libs.DataBaseConnection;

/*
 * Handles student related database operations.
 * Currently used only for authentication.
 */
public class StudentData {

    private Connection con = DataBaseConnection.getConnection();

    // Fetches student password from database and checks login
    public boolean checkPassword(String userid, String password) {

        userid = userid.trim();
