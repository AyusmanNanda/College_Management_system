package college.libs;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

public class DataBaseConnection {

    // Private shared connection
    private static Connection con = null;

    //  Database configuration
    private static final String URL =
        "jdbc:mysql://localhost:3306/collegedata"
        + "?useSSL=false"
        + "&allowPublicKeyRetrieval=true";

    private static final String USER = "root";
    private static final String PASSWORD = "1234";

    //  Prevent object creation
    private DataBaseConnection() {
    }

    // 1️⃣ Get database connection
    public static Connection getConnection() {
        try {
            if (con == null || con.isClosed()) {
                Class.forName("com.mysql.cj.jdbc.Driver");
                con = DriverManager.getConnection(URL, USER, PASSWORD);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return con;
    }

    // 2️⃣ Check database connection
    public static boolean checkconnection() {
        try {
            Class.forName("com.mysql.cj.jdbc.Driver");
            Connection testCon =
                DriverManager.getConnection(URL, USER, PASSWORD);
            testCon.close();
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    // 3️⃣ Close database connection
    public static void closeConnection() {
        try {
            if (con != null && !con.isClosed()) {
                con.close();
                con = null;
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }
}
