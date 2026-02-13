package college.faculty;

import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.Statement;

import javax.swing.JOptionPane;

import college.libs.DataBaseConnection;

/*
 * Handles faculty related database operations.
 * Currently used only for authentication.
 */
public class FacultyData {

    private Connection con = DataBaseConnection.getConnection();

    public boolean checkPassword(String userid, String password) {

       

        userid = userid.trim();

        if (userid.isEmpty()) {
            JOptionPane.showMessageDialog(
                    null,
                    "Incorrect Userid or Password",
                    "Error",
                    JOptionPane.ERROR_MESSAGE
            );
            return false;
        }

        try {
            String query =
                    "SELECT password FROM faculties WHERE facultyid = '" + userid + "'";

            Statement st = con.createStatement();
            ResultSet rs = st.executeQuery(query);

            if (rs.next()) {
                String dbPassword = rs.getString("password");

                if (dbPassword != null && dbPassword.equals(password)) {
                    return true;
                }
            }

        } catch (Exception e) {
            e.printStackTrace();
            JOptionPane.showMessageDialog(
                    null,
                    "Database error while checking login",
                    "Error",
                    JOptionPane.ERROR_MESSAGE
            );
        }

        JOptionPane.showMessageDialog(
                null,
                "Incorrect Userid or Password",
                "Error",
                JOptionPane.ERROR_MESSAGE
        );
        return false;
    }
}
