package college.login;

import java.awt.Color;
import java.awt.EventQueue;
import java.awt.Font;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import java.awt.event.ComponentAdapter;
import java.awt.event.ComponentEvent;
import javax.swing.JButton;
import javax.swing.JFrame;
import javax.swing.JLabel;
import javax.swing.JPanel;
import javax.swing.Timer;

class LoginPageFrame extends JFrame implements ActionListener {

    private static final Color THEME_BLUE = new Color(39, 71, 122);

    private JPanel contentPane;
    private JPanel headerPanel;
    private JPanel centerPanel;
    private JPanel underlinePanel;
    private JLabel titleLabel;

    private JButton adminButton;
    private JButton facultyButton;
    private JButton studentButton;

    private LoginPanel adminPanel;
    private LoginPanel facultyPanel;
    private LoginPanel studentPanel;

    private Timer underlineTimer;
    private int targetUnderlineX;

    LoginPageFrame() {
        setTitle("Login");
        setSize(400, 300);
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setLocationRelativeTo(null);
        setResizable(true);

        contentPane = new JPanel();
        contentPane.setBackground(Color.WHITE);
        contentPane.setLayout(null);
        setContentPane(contentPane);

        // Header / branding panel
        headerPanel = new JPanel();
        headerPanel.setBackground(THEME_BLUE);
        headerPanel.setLayout(null);
        contentPane.add(headerPanel);

        titleLabel = new JLabel("College Login System");
        titleLabel.setForeground(Color.WHITE);
        titleLabel.setFont(new Font("Segoe UI", Font.BOLD, 22));
        headerPanel.add(titleLabel);

        centerPanel = new JPanel();
        centerPanel.setBackground(Color.WHITE);
        centerPanel.setLayout(null);
        contentPane.add(centerPanel);

        adminButton = new JButton("Admin");
        facultyButton = new JButton("Faculty");
        studentButton = new JButton("Student");

        adminButton.addActionListener(this);
        facultyButton.addActionListener(this);
        studentButton.addActionListener(this);

        centerPanel.add(adminButton);
        centerPanel.add(facultyButton);
        centerPanel.add(studentButton);

        // Underline indicator
        underlinePanel = new JPanel();
        underlinePanel.setBackground(THEME_BLUE);
        centerPanel.add(underlinePanel);

        // Animation timer for underline
        underlineTimer = new Timer(5, e -> animateUnderline());

        adminPanel = new LoginPanel("Admin");
        facultyPanel = new LoginPanel("Faculty");
        studentPanel = new LoginPanel("Student");

        centerPanel.add(adminPanel);
        centerPanel.add(facultyPanel);
        centerPanel.add(studentPanel);

        showPanel(studentPanel);
        updateLayout();
        snapUnderlineTo(studentButton);

        addComponentListener(new ComponentAdapter() {
            @Override
            public void componentResized(ComponentEvent e) {
                updateLayout();
                snapUnderlineTo(studentButton);
            }
        });
    }

    private void showPanel(LoginPanel panel) {
        adminPanel.setVisible(false);
        facultyPanel.setVisible(false);
        studentPanel.setVisible(false);
        panel.setVisible(true);
    }

    private void snapUnderlineTo(JButton button) {
        underlinePanel.setBounds(
                button.getX(),
                button.getY() + button.getHeight() + 2,
                button.getWidth(),
                3
        );
    }

    private void moveUnderlineAnimated(JButton button) {
        targetUnderlineX = button.getX();
        underlineTimer.start();
    }

    private void animateUnderline() {
        int currentX = underlinePanel.getX();

        if (currentX == targetUnderlineX) {
            underlineTimer.stop();
            return;
        }

        int step = currentX < targetUnderlineX ? 5 : -5;
        underlinePanel.setLocation(currentX + step, underlinePanel.getY());
    }

    private void updateLayout() {
        int width = getWidth();
        int height = getHeight();

        int headerHeight = 100;

        headerPanel.setBounds(0, 0, width, headerHeight);
        titleLabel.setBounds(30, 35, width - 60, 30);

        centerPanel.setBounds(0, headerHeight, width, height - headerHeight);

        int buttonWidth = 120;
        int buttonHeight = 40;
        int gap = 20;

        int totalWidth = (buttonWidth * 3) + (gap * 2);
        int startX = (width - totalWidth) / 2;

        adminButton.setBounds(startX, 20, buttonWidth, buttonHeight);
        facultyButton.setBounds(startX + buttonWidth + gap, 20, buttonWidth, buttonHeight);
        studentButton.setBounds(startX + (buttonWidth + gap) * 2, 20, buttonWidth, buttonHeight);

        adminPanel.setBounds(0, 80, width, height - headerHeight - 80);
        facultyPanel.setBounds(0, 80, width, height - headerHeight - 80);
        studentPanel.setBounds(0, 80, width, height - headerHeight - 80);
    }

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

    public static void main(String[] args) {
        EventQueue.invokeLater(() -> {
            LoginPageFrame frame = new LoginPageFrame();
            frame.setVisible(true);
            frame.setExtendedState(JFrame.MAXIMIZED_BOTH);
        });
    }
}
