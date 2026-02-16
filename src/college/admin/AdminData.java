package college.admin;

import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.Statement;

import college.libs.DataBaseConnection;

/*
 * Handles admin related database operations.
 * Currently used only for authentication.
 */
public class AdminData {

    private Connection con = DataBaseConnection.getConnection();

    // Fetches admin password from database and checks login
    public boolean checkPassword(String userid, String password) {

        userid = userid.trim();

        if (!userid.equalsIgnoreCase("Admin")) {
            return false;
        }

        try {
            String query = "SELECT password FROM admin";
            Statement st = con.createStatement();
            ResultSet rs = st.executeQuery(query);

            if (rs.next()) {
                String dbPassword = rs.getString("password");

                if (dbPassword != null && dbPassword.equals(password)) {
                    return true;
                }
            }

        } catch (Exception e) {
            e.printStackTrace();  // logs in console only
        }

        return false;
    }
    // Fetch full admin details (single row system)
    public Admin getAdminDetails() {

        try {
            String query = "SELECT * FROM admin";
            Statement st = con.createStatement();
            ResultSet rs = st.executeQuery(query);

            if (rs.next()) {

                return new Admin(
                        rs.getString("collagename"),
                        rs.getString("address"),
                        rs.getString("emailid"),
                        rs.getString("contactnumber"),
                        rs.getString("website"),
                        rs.getString("lastlogin"),
                        rs.getString("facebook"),
                        rs.getString("instagram"),
                        rs.getString("twitter"),
                        rs.getString("linkedin"),
                        rs.getInt("activestatus") == 1
                );
            }

        } catch (Exception e) {
            e.printStackTrace();
        }

        return null;
    }
    // Updates admin table with new details
    public boolean updateAdminDetails(Admin admin) {

        try {
            String query = "UPDATE admin SET "
                    + "collagename = ?, "
                    + "address = ?, "
                    + "emailid = ?, "
                    + "contactnumber = ?, "
                    + "website = ?";

            java.sql.PreparedStatement ps = con.prepareStatement(query);

            ps.setString(1, admin.getCollagename());
            ps.setString(2, admin.getAddress());
            ps.setString(3, admin.getEmailid());
            ps.setString(4, admin.getContactnumber());
            ps.setString(5, admin.getWebsite());

            int rows = ps.executeUpdate();

            return rows > 0;

        } catch (Exception e) {
            e.printStackTrace();
        }

        return false;
    }


}
