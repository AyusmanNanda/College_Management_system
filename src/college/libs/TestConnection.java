package college.libs;

import java.sql.Connection;

public class TestConnection {
    public static void main(String[] args) {
        Connection con = DatabaseConnection.getConnection();

        if (con != null) {
            System.out.println("Connection established successfully!");
        } else {
            System.out.println("Connection failed!");
        }
    }
}
