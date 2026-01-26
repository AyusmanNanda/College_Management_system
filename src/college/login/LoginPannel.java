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

    private JLabel titleLabel;
    private JTextField userIdField;
    private JPasswordField passwordField;
    private JButton loginButton;

    LoginPanel(String loginProfile) {

        setLayout(null);
        setOpaque(false); // REQUIRED for alpha background
        setBorder(new LineBorder(THEME_BLUE));

        titleLabel = new JLabel(loginProfile + " Login");
        titleLabel.setForeground(Color.WHITE);
        titleLabel.setFont(new Font("Segoe UI", Font.BOLD, 22));
        titleLabel.setHorizontalAlignment(SwingConstants.CENTER);
        add(titleLabel);

        userIdField = new JTextField();
        userIdField.setFont(new Font("Segoe UI", Font.PLAIN, 16));
        userIdField.setBorder(new EmptyBorder(0, 8, 0, 0));
        add(userIdField);

        passwordField = new JPasswordField();
        passwordField.setFont(new Font("Segoe UI", Font.PLAIN, 16));
        passwordField.setBorder(userIdField.getBorder());
        add(passwordField);

        loginButton = new JButton("Login");
        loginButton.setFont(new Font("Segoe UI", Font.BOLD, 16));
        loginButton.setForeground(Color.WHITE);
        loginButton.setBackground(THEME_BLUE);
        loginButton.setFocusable(false);
        loginButton.setBorderPainted(false);
        add(loginButton);
    }

    // LoginPageFrame
    void updateLayout(int panelWidth, int panelHeight) {

        int fieldWidth = 260;
        int fieldHeight = 40;

        int centerX = (panelWidth - fieldWidth) / 2;

        titleLabel.setBounds(0, 40, panelWidth, 40);
        userIdField.setBounds(centerX, 120, fieldWidth, fieldHeight);
        passwordField.setBounds(centerX, 180, fieldWidth, fieldHeight);
        loginButton.setBounds(centerX, 240, fieldWidth, fieldHeight);
    }

    @Override
    protected void paintComponent(java.awt.Graphics g) {
        g.setColor(new Color(0, 0, 0, 80));
        g.fillRect(0, 0, getWidth(), getHeight());
        super.paintComponent(g);
    }
}
