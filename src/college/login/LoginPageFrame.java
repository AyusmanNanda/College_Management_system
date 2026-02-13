package college.login;

import college.libs.ApplicationWindow;

import java.awt.Color;
import java.awt.EventQueue;
import java.awt.Font;
import java.awt.Graphics;
import java.awt.Graphics2D;
import java.awt.event.ComponentAdapter;
import java.awt.event.ComponentEvent;

import javax.swing.JLabel;
import javax.swing.JPanel;

// Main login window frame
class LoginPageFrame extends ApplicationWindow {

    // Global theme color
    private static final Color THEME_BLUE = new Color(39, 71, 122);

    // Root container panel
    private JPanel contentPane;

    // Top header bar
    private JPanel headerPanel;

    // Center area for login panel
    private JPanel centerPanel;

    // Header title label
    private JLabel titleLabel;

    // Single login panel
    private LoginPanel loginPanel;

    // Frame constructor
    LoginPageFrame() {
        setTitle("Login");

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

        loginPanel = new LoginPanel(this);
        centerPanel.add(loginPanel);

        // Handle window resize
        addComponentListener(new ComponentAdapter() {
            @Override
            public void componentResized(ComponentEvent e) {
                updateLayout();
            }
        });
    }

    @Override
    public void setVisible(boolean b) {
        super.setVisible(b);
        if (b) {
            updateLayout();
        }
    }

    // Calculate and apply component layout
    private void updateLayout() {
        int width = getWidth();
        int height = getHeight();
        int headerHeight = 100;

        headerPanel.setBounds(0, 0, width, headerHeight);
        titleLabel.setBounds(30, 35, width - 60, 30);

        centerPanel.setBounds(0, headerHeight, width, height - headerHeight);

        int panelY = 80;
        int maxPanelHeight = 470;
        int availableHeight = height - headerHeight - panelY;
        int panelHeight = Math.min(availableHeight, maxPanelHeight);

        int panelWidth = Math.min(width, 420);
        int panelX = (width - panelWidth) / 2;

        loginPanel.setBounds(panelX, panelY, panelWidth, panelHeight);
        loginPanel.updateLayout(panelWidth, panelHeight);
    }

    // Application entry point
    public static void main(String[] args) {
        EventQueue.invokeLater(() -> {
            LoginPageFrame frame = new LoginPageFrame();
            frame.setVisible(true);
        });
    }
}
