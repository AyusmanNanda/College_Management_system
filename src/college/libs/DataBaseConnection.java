package college.libs;

import java.sql.Connection;
import java.sql.DriverManager;

class DataBaseConnection {

    private static final String URL =
    "jdbc:mysql://localhost:3306/collegedata?useSSL=false&allowPublicKeyRetrieval=true";
    
    private static final String USER = "root";
    private static final String PASSWORD = "1234";

    public static Connection getConnection() {
        try {
            Class.forName("com.mysql.cj.jdbc.Driver");
            return DriverManager.getConnection(URL, USER, PASSWORD);
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }
}

