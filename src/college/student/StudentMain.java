package college.student;

import javax.swing.JFrame;
import javax.swing.JLabel;
import javax.swing.SwingConstants;

public class StudentMain extends JFrame {

    public StudentMain() {
        setTitle("Student Dashboard");
        setSize(500, 400);
        setLocationRelativeTo(null);
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);

        JLabel label = new JLabel("Welcome Student", SwingConstants.CENTER);
        add(label);
    }
}
