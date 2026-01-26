package college.login;

import java.awt.Color;
import java.awt.EventQueue;
import java.awt.Font;
import java.awt.Image;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import java.awt.event.ComponentAdapter;
import java.awt.event.ComponentEvent;
import java.io.File;
import java.io.IOException;
import javax.imageio.ImageIO;
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

    // Background image handling
    private JLabel backgroundLabel;
    private Timer imageTimer;
    private int imageIndex = 1;

    private JButton adminButton;
    private JButton facultyButton;
    private JButton studentButton;
    private JButton activeButton;

    private LoginPanel adminPanel;
    private LoginPanel facultyPanel;
    private LoginPanel studentPanel;

    private Timer underlineTimer;
    private Timer fadeTimer;

    private int targetUnderlineX;
    private int fadeAlpha;
    private LoginPanel fadingPanel;

    LoginPageFrame() {
        setTitle("Login");
        setSize(400, 300);
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setLocationRelativeTo(null);
        setResizable(true);

        contentPane = new JPanel(null);
        contentPane.setBackground(Color.WHITE);
        setContentPane(contentPane);

        // Background image sits at the very back
        backgroundLabel = new JLabel();
        contentPane.add(backgroundLabel);

        headerPanel = new JPanel(null);
        headerPanel.setBackground(THEME_BLUE);
        contentPane.add(headerPanel);

        titleLabel = new JLabel("College Login System");
        titleLabel.setForeground(Color.WHITE);
        titleLabel.setFont(new Font("Segoe UI", Font.BOLD, 22));
        headerPanel.add(titleLabel);

        centerPanel = new JPanel(null);
        centerPanel.setBackground(new Color(255, 255, 255, 230));
        contentPane.add(centerPanel);

        adminButton = new JButton("Admin");
        facultyButton = new JButton("Faculty");
        studentButton = new JButton("Student");

        styleButton(adminButton);
        styleButton(facultyButton);
        styleButton(studentButton);

        adminButton.addActionListener(this);
        facultyButton.addActionListener(this);
        studentButton.addActionListener(this);

        centerPanel.add(adminButton);
        centerPanel.add(facultyButton);
        centerPanel.add(studentButton);

        activeButton = studentButton;
        setActiveButton(studentButton);

        underlinePanel = new JPanel();
        underlinePanel.setBackground(THEME_BLUE);
        centerPanel.add(underlinePanel);

        underlineTimer = new Timer(5, e -> animateUnderline());
        fadeTimer = new Timer(20, e -> animateFade());

        adminPanel = new LoginPanel("Admin");
        facultyPanel = new LoginPanel("Faculty");
        studentPanel = new LoginPanel("Student");

        centerPanel.add(adminPanel);
        centerPanel.add(facultyPanel);
        centerPanel.add(studentPanel);

        showPanel(studentPanel);

        // Rotate background images every 5 seconds
        imageTimer = new Timer(5000, e -> changeBackgroundImage());
        imageTimer.start();
        loadBackgroundImage();

        updateLayout();
        snapUnderlineTo(activeButton);

        addComponentListener(new ComponentAdapter() {
            @Override
            public void componentResized(ComponentEvent e) {
                updateLayout();
                snapUnderlineTo(activeButton);
                loadBackgroundImage();
            }
        });
    }

    // ---------- Background image logic ----------

    private void changeBackgroundImage() {
        imageIndex++;
        if (imageIndex > 5) {
            imageIndex = 1;
        }
        loadBackgroundImage();
    }

    private void loadBackgroundImage() {
        try {
            Image img = ImageIO.read(
                    new File("./assets/backgroundimage" + imageIndex + ".jpg")
            );

            Image scaled = img.getScaledInstance(
                    getWidth(),
                    getHeight(),
                    Image.SCALE_SMOOTH
            );

            backgroundLabel.setIcon(new javax.swing.ImageIcon(scaled));
        } catch (IOException ignored) {
            // If image is missing, just skip it
        }
    }

    // ---------- Existing logic below (unchanged) ----------

    private void styleButton(JButton button) {
        button.setFocusPainted(false);
        button.setBorderPainted(false);
        button.setContentAreaFilled(false);
        button.setOpaque(false);
        button.setForeground(Color.DARK_GRAY);
        button.setFont(new Font("Segoe UI", Font.BOLD, 14));
    }

    private void setActiveButton(JButton button) {
        adminButton.setForeground(Color.DARK_GRAY);
        facultyButton.setForeground(Color.DARK_GRAY);
        studentButton.setForeground(Color.DARK_GRAY);

        button.setForeground(THEME_BLUE);
        activeButton = button;
    }

    private void showPanel(LoginPanel panel) {
        adminPanel.setVisible(false);
        facultyPanel.setVisible(false);
        studentPanel.setVisible(false);
        startFade(panel);
    }

    private void startFade(LoginPanel panel) {
        fadeAlpha = 40;
        fadingPanel = panel;
        panel.setVisible(true);
        panel.setBackground(new Color(0, 0, 0, fadeAlpha));
        fadeTimer.start();
    }

    private void animateFade() {
        fadeAlpha += 15;
        if (fadeAlpha >= 120) {
            fadeAlpha = 120;
            fadeTimer.stop();
        }
        fadingPanel.setBackground(new Color(0, 0, 0, fadeAlpha));
        fadingPanel.repaint();
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
        setActiveButton(button);
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
        underlinePanel.setLocation(
                currentX + (currentX < targetUnderlineX ? 5 : -5),
                underlinePanel.getY()
        );
    }

    private void updateLayout() {
        int width = getWidth();
        int height = getHeight();
        int headerHeight = 100;

        backgroundLabel.setBounds(0, 0, width, height);

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
        int panelHeight = height - headerHeight - panelY;

        int panelWidth = Math.min(width, 420);
        int panelX = (width - panelWidth) / 2;

        adminPanel.setBounds(panelX, panelY, panelWidth, panelHeight);
        facultyPanel.setBounds(panelX, panelY, panelWidth, panelHeight);
        studentPanel.setBounds(panelX, panelY, panelWidth, panelHeight);

        adminPanel.updateLayout(panelWidth, panelHeight);
        facultyPanel.updateLayout(panelWidth, panelHeight);
        studentPanel.updateLayout(panelWidth, panelHeight);
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
