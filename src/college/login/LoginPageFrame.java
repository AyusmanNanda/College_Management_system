package college.login;

import java.awt.Color;
import java.awt.EventQueue;
import java.awt.Font;
import java.awt.Graphics;
import java.awt.Graphics2D;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import java.awt.event.ComponentAdapter;
import java.awt.event.ComponentEvent;
import javax.swing.JButton;
import javax.swing.JFrame;
import javax.swing.JLabel;
import javax.swing.JPanel;
import javax.swing.Timer;

// Main login window frame
class LoginPageFrame extends JFrame implements ActionListener {

    // Global theme color
    private static final Color THEME_BLUE = new Color(39, 71, 122);

    // Root container panel
    private JPanel contentPane;

    // Top header bar
    private JPanel headerPanel;

    // Center area for buttons and login panels
    private JPanel centerPanel;

    // Animated underline indicator
    private JPanel underlinePanel;

    // Header title label
    private JLabel titleLabel;

    // Role selection buttons
    private JButton adminButton;
    private JButton facultyButton;
    private JButton studentButton;

    // Currently selected button
    private JButton activeButton;

    // Login panels for each role
    private LoginPanel adminPanel;
    private LoginPanel facultyPanel;
    private LoginPanel studentPanel;

    // Timer for underline animation
    private Timer underlineTimer;

    // Timer for fade-in animation
    private Timer fadeTimer;

    // Target X position for underline
    private int targetUnderlineX;

    // Alpha value for fade animation
    private int fadeAlpha;

    // Panel currently fading in
    private LoginPanel fadingPanel;

    // Frame constructor
    LoginPageFrame() {
        setTitle("Login");
        setSize(400, 300);
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setLocationRelativeTo(null);
        setResizable(true);

        // Base panel with absolute layout
        contentPane = new JPanel(null);
        contentPane.setBackground(Color.WHITE);
        setContentPane(contentPane);

        // Header container
        headerPanel = new JPanel(null);
        headerPanel.setBackground(THEME_BLUE);
        contentPane.add(headerPanel);

        // Header title text
        titleLabel = new JLabel("College Login System");
        titleLabel.setForeground(Color.WHITE);
        titleLabel.setFont(new Font("Segoe UI", Font.BOLD, 22));
        headerPanel.add(titleLabel);

        // Center container (FIXED: correct transparency handling)
        centerPanel = new JPanel(null) {
            @Override
            protected void paintComponent(Graphics g) {
                Graphics2D g2 = (Graphics2D) g.create();
                g2.setColor(new Color(255, 255, 255, 230));
                g2.fillRect(0, 0, getWidth(), getHeight());
                g2.dispose();
                super.paintComponent(g);
            }
        };
        centerPanel.setOpaque(false);
        contentPane.add(centerPanel);

        // Role buttons
        adminButton = new JButton("Admin");
        facultyButton = new JButton("Faculty");
        studentButton = new JButton("Student");

        // Apply visual styling to buttons
        styleButton(adminButton);
        styleButton(facultyButton);
        styleButton(studentButton);

        // Register click listeners
        adminButton.addActionListener(this);
        facultyButton.addActionListener(this);
        studentButton.addActionListener(this);

        // Add buttons to center panel
        centerPanel.add(adminButton);
        centerPanel.add(facultyButton);
        centerPanel.add(studentButton);

        // Default selected role
        activeButton = studentButton;
        setActiveButton(studentButton);

        // Underline indicator panel
        underlinePanel = new JPanel();
        underlinePanel.setBackground(THEME_BLUE);
        centerPanel.add(underlinePanel);

        // Animation timers
        underlineTimer = new Timer(5, e -> animateUnderline());
        fadeTimer = new Timer(20, e -> animateFade());

        // Login panels
        adminPanel = new LoginPanel("Admin");
        facultyPanel = new LoginPanel("Faculty");
        studentPanel = new LoginPanel("Student");

        // Add panels to center container
        centerPanel.add(adminPanel);
        centerPanel.add(facultyPanel);
        centerPanel.add(studentPanel);

        // Show default panel
        showPanel(studentPanel);

        // Initial layout setup
        updateLayout();
        snapUnderlineTo(activeButton);

        // Handle window resize
        addComponentListener(new ComponentAdapter() {
            @Override
            public void componentResized(ComponentEvent e) {
                updateLayout();
                snapUnderlineTo(activeButton);
            }
        });
    }

    // Button visual configuration
    private void styleButton(JButton button) {
        button.setFocusPainted(false);
        button.setBorderPainted(false);
        button.setContentAreaFilled(false);
        button.setOpaque(false);
        button.setForeground(Color.DARK_GRAY);
        button.setFont(new Font("Segoe UI", Font.BOLD, 14));
    }

    // Update active button color
    private void setActiveButton(JButton button) {
        adminButton.setForeground(Color.DARK_GRAY);
        facultyButton.setForeground(Color.DARK_GRAY);
        studentButton.setForeground(Color.DARK_GRAY);

        button.setForeground(THEME_BLUE);
        activeButton = button;
    }

    // Switch visible login panel
    private void showPanel(LoginPanel panel) {
        adminPanel.setVisible(false);
        facultyPanel.setVisible(false);
        studentPanel.setVisible(false);
        startFade(panel);
    }

    // Start fade animation for panel
    private void startFade(LoginPanel panel) {
        fadeAlpha = 40;
        fadingPanel = panel;
        panel.setVisible(true);
        panel.setBackground(new Color(0, 0, 0, fadeAlpha));
        fadeTimer.start();
    }

    // Fade animation step
    private void animateFade() {
        fadeAlpha += 15;
        if (fadeAlpha >= 120) {
            fadeAlpha = 120;
            fadeTimer.stop();
        }
        fadingPanel.setBackground(new Color(0, 0, 0, fadeAlpha));
        fadingPanel.repaint();
    }

    // Instantly position underline
    private void snapUnderlineTo(JButton button) {
        underlinePanel.setBounds(
                button.getX(),
                button.getY() + button.getHeight() + 2,
                button.getWidth(),
                3
        );
    }

    // Animate underline movement
    private void moveUnderlineAnimated(JButton button) {
        setActiveButton(button);
        targetUnderlineX = button.getX();
        underlineTimer.start();
    }

    // Underline animation step
    private void animateUnderline() {
        int currentX = underlinePanel.getX();
        if (Math.abs(currentX - targetUnderlineX) <= 5) {
            underlinePanel.setLocation(targetUnderlineX, underlinePanel.getY());
            underlineTimer.stop();
            return;
        }
        underlinePanel.setLocation(
                currentX + (currentX < targetUnderlineX ? 5 : -5),
                underlinePanel.getY()
        );
    }

    // Calculate and apply component layout
    private void updateLayout() {
        int width = getWidth();
        int height = getHeight();
        int headerHeight = 100;

        headerPanel.setBounds(0, 0, width, headerHeight);
        titleLabel.setBounds(30, 35, width - 60, 30);

        centerPanel.setBounds(0, headerHeight, width, height - headerHeight);

        int buttonWidth = 120;
        int gap = 20;
        int startX = (width - (buttonWidth * 3 + gap * 2)) / 2;

        adminButton.setBounds(startX, 20, buttonWidth, 40);
        facultyButton.setBounds(startX + buttonWidth + gap, 20, buttonWidth, 40);
        studentButton.setBounds(startX + (buttonWidth + gap) * 2, 20, buttonWidth, 40);

        int panelY = 80;

        int maxPanelHeight = 470;
        int availableHeight = height - headerHeight - panelY;
        int panelHeight = Math.min(availableHeight, maxPanelHeight);

        int panelWidth = Math.min(width, 420);
        int panelX = (width - panelWidth) / 2;

        adminPanel.setBounds(panelX, panelY, panelWidth, panelHeight);
        facultyPanel.setBounds(panelX, panelY, panelWidth, panelHeight);
        studentPanel.setBounds(panelX, panelY, panelWidth, panelHeight);

        adminPanel.updateLayout(panelWidth, panelHeight);
        facultyPanel.updateLayout(panelWidth, panelHeight);
        studentPanel.updateLayout(panelWidth, panelHeight);
    }

    // Handle role button clicks
    @Override
    public void actionPerformed(ActionEvent e) {
        if (e.getSource() == adminButton) {
            showPanel(adminPanel);
            moveUnderlineAnimated(adminButton);
        } else if (e.getSource() == facultyButton) {
            showPanel(facultyPanel);
            moveUnderlineAnimated(facultyButton);
        } else if (e.getSource() == studentButton) {
            showPanel(studentPanel);
            moveUnderlineAnimated(studentButton);
        }
    }

    // Application entry point
    public static void main(String[] args) {
        EventQueue.invokeLater(() -> {
            LoginPageFrame frame = new LoginPageFrame();
            frame.setVisible(true);
            frame.setExtendedState(JFrame.MAXIMIZED_BOTH);
        });
    }
}
