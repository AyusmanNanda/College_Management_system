package college.login;

import java.awt.Color;
import java.awt.EventQueue;
import java.awt.Font;
import javax.swing.JFrame;
import javax.swing.JLabel;
import javax.swing.JPanel;
import javax.swing.SwingConstants;

class LoginPageFrame extends JFrame {

    private JPanel contentPane;
    private JPanel headerPanel;
    private JLabel titleLabel;

    LoginPageFrame() {
        // Configure the main login window
        setTitle("Login");
        setSize(400, 300);
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setLocationRelativeTo(null);

        // Allow the window to be resized and maximized
        setResizable(true);

        // Root container for manual component positioning
        contentPane = new JPanel();
        contentPane.setBackground(Color.WHITE);
        contentPane.setLayout(null);
        setContentPane(contentPane);

        // Top header area for branding or title
        headerPanel = new JPanel();
        headerPanel.setBackground(new Color(39, 71, 122));
        headerPanel.setBounds(0, 0, 400, 60);
        headerPanel.setLayout(null);
        contentPane.add(headerPanel);

        // Application title displayed in the header
        titleLabel = new JLabel("College Login System");
        titleLabel.setForeground(Color.WHITE);
        titleLabel.setFont(new Font("Segoe UI", Font.BOLD, 20));
        titleLabel.setHorizontalAlignment(SwingConstants.LEFT);
        titleLabel.setBounds(20, 15, 300, 30);
        headerPanel.add(titleLabel);
    }

    public static void main(String[] args) {

        // Start UI creation on the Event Dispatch Thread
        EventQueue.invokeLater(() -> {
            LoginPageFrame frame = new LoginPageFrame();
            frame.setVisible(true);
        });
    }
}
