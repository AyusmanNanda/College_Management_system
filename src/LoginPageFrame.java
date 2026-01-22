package college.login;

import java.awt.Color;
import java.awt.EventQueue;
import javax.swing.JFrame;
import javax.swing.JPanel;

class LoginPageFrame extends JFrame {

    private JPanel contentPane;
    private JPanel headerPanel;

    LoginPageFrame() {
        // Configure the main login window
        setTitle("Login");
        setSize(400, 300);
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setLocationRelativeTo(null);

        // Root container for manual component positioning
        contentPane = new JPanel();
        contentPane.setBackground(Color.WHITE);
        contentPane.setLayout(null);
        setContentPane(contentPane);

        // Top header area for branding or title
        headerPanel = new JPanel();
        headerPanel.setBackground(new Color(39, 71, 122)); // updated header color
        headerPanel.setBounds(0, 0, 400, 60);
        contentPane.add(headerPanel);
    }

    public static void main(String[] args) {

        // Start UI creation on the Event Dispatch Thread
        EventQueue.invokeLater(() -> {
            LoginPageFrame frame = new LoginPageFrame();
            frame.setVisible(true);
        });
    }
}
