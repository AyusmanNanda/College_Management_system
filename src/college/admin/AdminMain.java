package college.admin;

import college.libs.ApplicationWindow;
import college.libs.UITheme;

import javax.swing.*;
import java.awt.*;

/**
 * AdminMain is the main dashboard window for Admin.
 *
 * This class extends ApplicationWindow to ensure
 * consistent window behavior and scalability.
 */
public class AdminMain extends ApplicationWindow {

    private Admin admin;
    private AdminProfilePanel profilePanel;
    private JPanel contentPanel;
    private CardLayout cardLayout;
    private JPanel sidebarPanel;
    private JButton activeSidebarButton;


    public AdminMain() {

        admin = new Admin(
                "A001",
                "Default Admin",
                "admin@college.com",
                "9999999999",
                "System Administrator"
        );

        initializeWindow();
    }
    /**
     * Creates modern blue header panel.
     */
    private JPanel createHeaderPanel() {

        JPanel panel = new JPanel(new BorderLayout());
        panel.setPreferredSize(new Dimension(0, 70));
        panel.setBackground(UITheme.PRIMARY_BLUE);
        panel.setBorder(BorderFactory.createEmptyBorder(0, 25, 0, 0));

        JLabel titleLabel = new JLabel("Admin Dashboard");
        titleLabel.setForeground(UITheme.TEXT_WHITE);
        titleLabel.setFont(UITheme.HEADER_FONT);

        panel.add(titleLabel, BorderLayout.WEST);

        return panel;
    }
    /**
     * Creates styled sidebar button with hover and active behavior.
     */
    private JButton createSidebarButton(String text) {

        JButton button = new JButton(text);
        button.setMaximumSize(new Dimension(Integer.MAX_VALUE, 40));
        button.setAlignmentX(Component.LEFT_ALIGNMENT);

        button.setFocusPainted(false);
        button.setBorderPainted(false);
        button.setBackground(UITheme.PRIMARY_BLUE);
        button.setForeground(Color.WHITE);
        button.setFont(new Font("Segoe UI", Font.PLAIN, 14));

        // Hover effect
        button.addMouseListener(new java.awt.event.MouseAdapter() {

            @Override
            public void mouseEntered(java.awt.event.MouseEvent evt) {
                if (!button.getBackground().equals(UITheme.PRIMARY_BLUE_DARK)) {
                    button.setBackground(UITheme.PRIMARY_BLUE_DARK);
                }
            }

            @Override
            public void mouseExited(java.awt.event.MouseEvent evt) {
                if (!button.getBackground().equals(UITheme.PRIMARY_BLUE_DARK)) {
                    button.setBackground(UITheme.PRIMARY_BLUE);
                }
            }
        });

        return button;
    }
    /**
     * Switches content section and updates active sidebar button.
     */
    private void switchSection(String cardName, JButton clickedButton) {

        cardLayout.show(contentPanel, cardName);

        if (activeSidebarButton != null) {
            activeSidebarButton.setBackground(UITheme.PRIMARY_BLUE);
        }

        activeSidebarButton = clickedButton;
        activeSidebarButton.setBackground(UITheme.PRIMARY_BLUE_DARK);
    }


    /**
     * Creates left sidebar navigation panel.
     */
    private JPanel createSidebar() {

        JPanel panel = new JPanel();
        panel.setPreferredSize(new Dimension(180, 0));
        panel.setLayout(new BoxLayout(panel, BoxLayout.Y_AXIS));
        panel.setBackground(UITheme.PRIMARY_BLUE);

        JButton profileButton = createSidebarButton("Profile");
        JButton attendanceButton = createSidebarButton("Attendance");

        profileButton.addActionListener(e ->
                switchSection("PROFILE", profileButton)
        );

        attendanceButton.addActionListener(e ->
                switchSection("ATTENDANCE", attendanceButton)
        );

        panel.add(Box.createVerticalStrut(20));
        panel.add(profileButton);
        panel.add(Box.createVerticalStrut(10));
        panel.add(attendanceButton);

        return panel;
    }


    /**
     * Creates a temporary Attendance panel.
     * This validates CardLayout scalability.
     */
    private JPanel createAttendancePanel() {

        JPanel panel = new JPanel(new BorderLayout());
        panel.setBackground(UITheme.BACKGROUND_WHITE);

        JLabel label = new JLabel("Attendance Section");
        label.setFont(new Font("Segoe UI", Font.BOLD, 18));
        label.setHorizontalAlignment(SwingConstants.CENTER);

        panel.add(label, BorderLayout.CENTER);

        return panel;
    }




    private void initializeWindow() {

        setTitle("Admin");

        JPanel rootPanel = new JPanel(new BorderLayout());
        rootPanel.setBackground(UITheme.BACKGROUND_WHITE);

        JPanel headerPanel = createHeaderPanel();

        // Initialize CardLayout FIRST
        cardLayout = new CardLayout();
        contentPanel = new JPanel(cardLayout);
        contentPanel.setBackground(UITheme.BACKGROUND_WHITE);
        contentPanel.setBorder(BorderFactory.createEmptyBorder(20, 30, 20, 30));

        profilePanel = new AdminProfilePanel(admin);
        contentPanel.add(profilePanel, "PROFILE");
        contentPanel.add(createAttendancePanel(), "ATTENDANCE");

        // Now create sidebar (cardLayout is ready)
        sidebarPanel = createSidebar();

        rootPanel.add(headerPanel, BorderLayout.NORTH);
        rootPanel.add(sidebarPanel, BorderLayout.WEST);
        rootPanel.add(contentPanel, BorderLayout.CENTER);

        getContentPane().add(rootPanel, BorderLayout.CENTER);

        profilePanel.getEditDetailsButton().addActionListener(e ->
                new EditAdminDetailsDialog(this, admin, profilePanel).setVisible(true)
        );

        // Set default active AFTER everything is initialized
        cardLayout.show(contentPanel, "PROFILE");
    }







}
