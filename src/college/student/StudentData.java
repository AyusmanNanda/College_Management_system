package college.student;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;

import college.libs.DataBaseConnection;

public class StudentData {

    public boolean checkPassword(String userid, String password) {

        boolean result = false;

        try {
            Connection con = DataBaseConnection.getConnection();

            String sql = "SELECT * FROM students WHERE userid=? AND password=?";
            PreparedStatement ps = con.prepareStatement(sql);
            ps.setString(1, userid);
            ps.setString(2, password);

            ResultSet rs = ps.executeQuery();

            if (rs.next()) {
                result = true;
            }

        } catch (Exception e) {
            e.printStackTrace();
        }

        return result;
    }
}

