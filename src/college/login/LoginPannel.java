package college.login;

import java.awt.Color;
import java.awt.Font;
import java.awt.Graphics;
import java.awt.Graphics2D;

import javax.swing.JButton;
import javax.swing.JLabel;
import javax.swing.JPanel;
import javax.swing.JPasswordField;
import javax.swing.JTextField;
import javax.swing.SwingConstants;
import javax.swing.border.EmptyBorder;
import javax.swing.border.LineBorder;

// Reusable login form panel
class LoginPanel extends JPanel {

    // Shared theme color
    private static final Color THEME_BLUE = new Color(39, 71, 122);

    // Panel title label
    private JLabel titleLabel;

    // User ID input field
    private JTextField userIdField;

    // Password input field
    private JPasswordField passwordField;

    // Login action button
    private JButton loginButton;

    // Panel constructor
    LoginPanel(String loginProfile) {

        // Absolute layout for precise positioning
        setLayout(null);

        // Required for custom alpha painting
        setOpaque(false);

        // Panel border styling
        setBorder(new LineBorder(THEME_BLUE));

        // Title text
        titleLabel = new JLabel(loginProfile + " Login");
        titleLabel.setForeground(Color.WHITE);
        titleLabel.setFont(new Font("Segoe UI", Font.BOLD, 22));
        titleLabel.setHorizontalAlignment(SwingConstants.CENTER);
        add(titleLabel);

        // User ID field
        userIdField = new JTextField();
        userIdField.setFont(new Font("Segoe UI", Font.PLAIN, 16));
        userIdField.setBorder(new EmptyBorder(0, 8, 0, 0));
        add(userIdField);

        // Password field
        passwordField = new JPasswordField();
        passwordField.setFont(new Font("Segoe UI", Font.PLAIN, 16));
        passwordField.setBorder(userIdField.getBorder());
        add(passwordField);

        // Login button
        loginButton = new JButton("Login");
        loginButton.setFont(new Font("Segoe UI", Font.BOLD, 16));
        loginButton.setForeground(Color.WHITE);
        loginButton.setBackground(THEME_BLUE);
        loginButton.setFocusable(false);
        loginButton.setBorderPainted(false);
        add(loginButton);
    }

    // Called by LoginPageFrame to position components
    void updateLayout(int panelWidth, int panelHeight) {

        // Input field dimensions
        int fieldWidth = 260;
        int fieldHeight = 40;

        // Horizontal centering calculation
        int centerX = (panelWidth - fieldWidth) / 2;

        // Component positioning
        titleLabel.setBounds(0, 40, panelWidth, 40);
        userIdField.setBounds(centerX, 120, fieldWidth, fieldHeight);
        passwordField.setBounds(centerX, 180, fieldWidth, fieldHeight);
        loginButton.setBounds(centerX, 240, fieldWidth, fieldHeight);
    }

    // Custom translucent background rendering
    @Override
    protected void paintComponent(Graphics g) {

        // Create isolated graphics context to avoid state leakage
        Graphics2D g2 = (Graphics2D) g.create();

        // Paint translucent background
        g2.setColor(new Color(0, 0, 0, 80));
        g2.fillRect(0, 0, getWidth(), getHeight());

        // Dispose graphics context
        g2.dispose();

        // Continue normal Swing painting
        super.paintComponent(g);
    }
}
