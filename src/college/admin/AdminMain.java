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
        panel.setPreferredSize(new Dimension(0, 60));
        panel.setBackground(UITheme.PRIMARY_BLUE);
        panel.setBorder(BorderFactory.createEmptyBorder(0, 25, 0, 0));

        JLabel titleLabel = new JLabel("Admin Dashboard");
        titleLabel.setForeground(Color.WHITE);
        titleLabel.setFont(new Font("SansSerif", Font.BOLD, 18));

        panel.add(titleLabel, BorderLayout.WEST);

        return panel;
    }



    private void initializeWindow() {

        setTitle("Admin");

        // Root container
        JPanel rootPanel = new JPanel(new BorderLayout());
        rootPanel.setBackground(UITheme.BACKGROUND_LIGHT);

        // Header panel (blue theme)
        JPanel headerPanel = createHeaderPanel();

        // Main content panel
        JPanel contentPanel = new JPanel(new BorderLayout());
        contentPanel.setBorder(BorderFactory.createEmptyBorder(20, 30, 20, 30));
        contentPanel.setBackground(UITheme.BACKGROUND_LIGHT);

        profilePanel = new AdminProfilePanel(admin);
        contentPanel.add(profilePanel, BorderLayout.CENTER);

        rootPanel.add(headerPanel, BorderLayout.NORTH);
        rootPanel.add(contentPanel, BorderLayout.CENTER);

        getContentPane().add(rootPanel, BorderLayout.CENTER);

        // Edit button listener
        profilePanel.getEditDetailsButton().addActionListener(e ->
                new EditAdminDetailsDialog(this, admin, profilePanel).setVisible(true)
        );
    }



}
