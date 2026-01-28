package college.admin;

import javax.swing.JFrame;
import javax.swing.JLabel;
import javax.swing.SwingConstants;
import java.awt.Font;

public class AdminMain extends JFrame {

    public AdminMain() {
        setTitle("Admin");
        setSize(400, 300);
        setLocationRelativeTo(null);
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);

        JLabel label = new JLabel("Hello Admin");
        label.setHorizontalAlignment(SwingConstants.CENTER);
        label.setFont(new Font("Segoe UI", Font.BOLD, 24));
        add(label);
    }
}
