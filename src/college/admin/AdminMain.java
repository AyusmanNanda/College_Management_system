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

    private void initializeWindow() {

        setTitle("Admin");

        JPanel rootPanel = new JPanel(new BorderLayout());
        rootPanel.setBackground(UITheme.BACKGROUND_WHITE);

        JPanel headerPanel = createHeaderPanel();

        // Card layout for future section switching
        cardLayout = new CardLayout();
        contentPanel = new JPanel(cardLayout);
        contentPanel.setBackground(UITheme.BACKGROUND_WHITE);
        contentPanel.setBorder(BorderFactory.createEmptyBorder(20, 30, 20, 30));

        // Profile section
        profilePanel = new AdminProfilePanel(admin);

        contentPanel.add(profilePanel, "PROFILE");

        rootPanel.add(headerPanel, BorderLayout.NORTH);
        rootPanel.add(contentPanel, BorderLayout.CENTER);

        getContentPane().add(rootPanel, BorderLayout.CENTER);

        // Button action
        profilePanel.getEditDetailsButton().addActionListener(e ->
                new EditAdminDetailsDialog(this, admin, profilePanel).setVisible(true)
        );

        // Show default card
        cardLayout.show(contentPanel, "PROFILE");
    }





}
