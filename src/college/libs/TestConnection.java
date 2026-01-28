package college.libs;

import java.sql.Connection;

public class TestConnection {

    public static void main(String[] args) {

        // Test checkconnection()
        if (DataBaseConnection.checkconnection()) {
            System.out.println("checkconnection(): SUCCESS");
        } else {
            System.out.println("checkconnection(): FAILED");
            return;
        }

        // Test getConnection()
        Connection con = DataBaseConnection.getConnection();
        if (con != null) {
            System.out.println("getConnection(): SUCCESS");
        } else {
            System.out.println("getConnection(): FAILED");
            return;
        }

        // Test closeConnection()
        DataBaseConnection.closeConnection();
        System.out.println("closeConnection(): SUCCESS");
    }
}
