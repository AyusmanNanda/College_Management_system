package college.student;

public class StudentData {

    public boolean checkPassword(String userid, String password) {
        return userid.equals("student") && password.equals("1234");
    }
}
