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
import javax.swing.SwingConstants;

class LoginPageFrame extends JFrame implements ActionListener {

    private JPanel contentPane;
    private JPanel headerPanel;
    private JPanel centerPanel;
    private JLabel titleLabel;

    private JButton adminButton;
    private JButton facultyButton;
    private JButton studentButton;

    LoginPageFrame() {
        // Configure the main login window
        setTitle("Login");
        setSize(400, 300);
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setLocationRelativeTo(null);
        setResizable(true);

        // Root container for manual component positioning
        contentPane = new JPanel();
        contentPane.setBackground(Color.WHITE);
        contentPane.setLayout(null);
        setContentPane(contentPane);

        // Top header area
        headerPanel = new JPanel();
        headerPanel.setBackground(new Color(39, 71, 122));
        headerPanel.setLayout(null);
        contentPane.add(headerPanel);

        // Application title
        titleLabel = new JLabel("College Login System");
        titleLabel.setForeground(Color.WHITE);
        titleLabel.setFont(new Font("Segoe UI", Font.BOLD, 20));
        titleLabel.setHorizontalAlignment(SwingConstants.LEFT);
        titleLabel.setBounds(20, 15, 300, 30);
        headerPanel.add(titleLabel);

        // Central area for login-related UI
        centerPanel = new JPanel();
        centerPanel.setBackground(Color.WHITE);
        centerPanel.setLayout(null);
        contentPane.add(centerPanel);

        // Role selection buttons
        adminButton = new JButton("Admin");
        facultyButton = new JButton("Faculty");
        studentButton = new JButton("Student");

        adminButton.setFont(new Font("Segoe UI", Font.BOLD, 14));
        facultyButton.setFont(new Font("Segoe UI", Font.BOLD, 14));
        studentButton.setFont(new Font("Segoe UI", Font.BOLD, 14));

        adminButton.addActionListener(this);
        facultyButton.addActionListener(this);
        studentButton.addActionListener(this);

        centerPanel.add(adminButton);
        centerPanel.add(facultyButton);
        centerPanel.add(studentButton);

        // Initial layout setup
        updateLayout();

        // Adjust UI components when the window is resized
        addComponentListener(new ComponentAdapter() {
            @Override
            public void componentResized(ComponentEvent e) {
                updateLayout();
            }
        });
    }

    // Handles manual resizing and positioning of UI components
    private void updateLayout() {
        int width = getWidth();
        int height = getHeight();

        headerPanel.setBounds(0, 0, width, 60);
        centerPanel.setBounds(0, 60, width, height - 60);

        int buttonWidth = 120;
        int buttonHeight = 40;
        int gap = 20;

        int totalWidth = (buttonWidth * 3) + (gap * 2);
        int startX = (width - totalWidth) / 2;
        int y = 80;

        adminButton.setBounds(startX, y, buttonWidth, buttonHeight);
        facultyButton.setBounds(startX + buttonWidth + gap, y, buttonWidth, buttonHeight);
        studentButton.setBounds(startX + (buttonWidth + gap) * 2, y, buttonWidth, buttonHeight);
    }

    @Override
    public void actionPerformed(ActionEvent e) {
        if (e.getSource() == adminButton) {
            System.out.println("Admin login selected");
        } else if (e.getSource() == facultyButton) {
            System.out.println("Faculty login selected");
        } else if (e.getSource() == studentButton) {
            System.out.println("Student login selected");
        }
    }

    public static void main(String[] args) {

        // Start UI creation on the Event Dispatch Thread
        EventQueue.invokeLater(() -> {
            LoginPageFrame frame = new LoginPageFrame();
            frame.setVisible(true);
        });
    }
}
