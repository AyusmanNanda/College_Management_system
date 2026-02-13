package college.student;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;

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

        try {
            String query = "SELECT password FROM students WHERE userid = ?";
            PreparedStatement ps = con.prepareStatement(query);
            ps.setString(1, userid);

            ResultSet rs = ps.executeQuery();

            if (rs.next()) {
                String dbPassword = rs.getString("password");

                if (dbPassword != null && dbPassword.equals(password)) {
                    return true;
                }
            }

        } catch (Exception e) {
            e.printStackTrace();  // log only, no popup
        }

        return false;
    }
}
