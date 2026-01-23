package college.login;

import java.awt.Color;
import java.awt.Font;
import javax.swing.JButton;
import javax.swing.JLabel;
import javax.swing.JPanel;
import javax.swing.JPasswordField;
import javax.swing.JTextField;
import javax.swing.SwingConstants;
import javax.swing.border.EmptyBorder;
import javax.swing.border.LineBorder;

class LoginPanel extends JPanel {

    private static final Color THEME_BLUE = new Color(39, 71, 122);

    private String loginProfile;

    private JLabel titleLabel;
    private JTextField userIdField;
    private JPasswordField passwordField;
    private JButton loginButton;

    LoginPanel(String loginProfile) {
        this.loginProfile = loginProfile;

        setLayout(null);
        setBackground(new Color(0, 0, 0, 80));
        setBorder(new LineBorder(THEME_BLUE));

        // Panel title
        titleLabel = new JLabel(loginProfile + " Login");
        titleLabel.setForeground(Color.WHITE);
        titleLabel.setFont(new Font("Segoe UI", Font.BOLD, 22));
        titleLabel.setHorizontalAlignment(SwingConstants.CENTER);
        titleLabel.setBounds(0, 30, 400, 40);
        add(titleLabel);

        // User ID field
        userIdField = new JTextField();
        userIdField.setFont(new Font("Segoe UI", Font.PLAIN, 16));
        userIdField.setBounds(70, 100, 260, 40);
        userIdField.setBorder(new EmptyBorder(0, 8, 0, 0));
        add(userIdField);

        // Password field
        passwordField = new JPasswordField();
        passwordField.setFont(new Font("Segoe UI", Font.PLAIN, 16));
        passwordField.setBounds(70, 160, 260, 40);
        passwordField.setBorder(userIdField.getBorder());
        add(passwordField);

        // Login button (UI only for now)
        loginButton = new JButton("Login");
        loginButton.setFont(new Font("Segoe UI", Font.BOLD, 16));
        loginButton.setForeground(Color.WHITE);
        loginButton.setBackground(THEME_BLUE);
        loginButton.setBounds(70, 220, 260, 40);
        loginButton.setFocusable(false);
        loginButton.setBorderPainted(false);
        add(loginButton);
    }
}
