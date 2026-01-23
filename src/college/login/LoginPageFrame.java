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
    private JButton activeButton;

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

        contentPane = new JPanel(null);
        contentPane.setBackground(Color.WHITE);
        setContentPane(contentPane);

        headerPanel = new JPanel(null);
        headerPanel.setBackground(THEME_BLUE);
        contentPane.add(headerPanel);

        titleLabel = new JLabel("College Login System");
        titleLabel.setForeground(Color.WHITE);
        titleLabel.setFont(new Font("Segoe UI", Font.BOLD, 22));
        headerPanel.add(titleLabel);

        centerPanel = new JPanel(null);
        centerPanel.setBackground(Color.WHITE);
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

        activeButton = studentButton;

        underlinePanel = new JPanel();
        underlinePanel.setBackground(THEME_BLUE);
        centerPanel.add(underlinePanel);

        underlineTimer = new Timer(5, e -> animateUnderline());

        adminPanel = new LoginPanel("Admin");
        facultyPanel = new LoginPanel("Faculty");
        studentPanel = new LoginPanel("Student");

        centerPanel.add(adminPanel);
        centerPanel.add(facultyPanel);
        centerPanel.add(studentPanel);

        showPanel(studentPanel);

        updateLayout();
        snapUnderlineTo(activeButton);

        addComponentListener(new ComponentAdapter() {
            @Override
            public void componentResized(ComponentEvent e) {
                updateLayout();
                snapUnderlineTo(activeButton);
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
        activeButton = button;
        targetUnderlineX = button.getX();
        underlineTimer.start();
    }

    private void animateUnderline() {
        int currentX = underlinePanel.getX();

        if (Math.abs(currentX - targetUnderlineX) <= 5) {
            underlinePanel.setLocation(targetUnderlineX, underlinePanel.getY());
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

        int panelY = 80;
        int panelHeight = height - headerHeight - panelY;

        adminPanel.setBounds(0, panelY, width, panelHeight);
        facultyPanel.setBounds(0, panelY, width, panelHeight);
        studentPanel.setBounds(0, panelY, width, panelHeight);

        adminPanel.updateLayout(adminPanel.getWidth(), adminPanel.getHeight());
        facultyPanel.updateLayout(facultyPanel.getWidth(), facultyPanel.getHeight());
        studentPanel.updateLayout(studentPanel.getWidth(), studentPanel.getHeight());
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
