package college.admin;

import college.libs.UITheme;

import javax.swing.*;
import java.awt.*;

/**
 * AdminProfilePanel displays college information
 * stored in the admin table.
 */
public class AdminProfilePanel extends JPanel {

    private Admin admin;

    private JLabel collegeNameLabel;
    private JLabel addressLabel;
    private JLabel emailLabel;
    private JLabel contactLabel;
    private JLabel websiteLabel;
    private JLabel lastLoginLabel;

    private JButton editDetailsButton;

    public AdminProfilePanel(Admin admin) {
        this.admin = admin;
        initializeUI();
    }

    private void initializeUI() {

        setLayout(new BorderLayout());
        setBackground(UITheme.BACKGROUND_WHITE);

        JPanel container = new JPanel();
        container.setLayout(new GridLayout(7, 1, 0, 12));
        container.setBorder(BorderFactory.createEmptyBorder(20, 20, 20, 20));
        container.setBackground(UITheme.BACKGROUND_WHITE);

        collegeNameLabel = createInfoLabel("College Name: " + admin.getCollagename());
        addressLabel = createInfoLabel("Address: " + admin.getAddress());
        emailLabel = createInfoLabel("Email: " + admin.getEmailid());
        contactLabel = createInfoLabel("Contact: " + admin.getContactnumber());
        websiteLabel = createInfoLabel("Website: " + admin.getWebsite());
        lastLoginLabel = createInfoLabel("Last Login: " + admin.getLastlogin());

        editDetailsButton = new JButton("Edit Details");
        editDetailsButton.setFont(new Font("Segoe UI", Font.PLAIN, 13));

        container.add(collegeNameLabel);
        container.add(addressLabel);
        container.add(emailLabel);
        container.add(contactLabel);
        container.add(websiteLabel);
        container.add(lastLoginLabel);
        container.add(editDetailsButton);

        add(container, BorderLayout.NORTH);
    }

    private JLabel createInfoLabel(String text) {
        JLabel label = new JLabel(text);
        label.setFont(new Font("Segoe UI", Font.PLAIN, 14));
        return label;
    }

    public JButton getEditDetailsButton() {
        return editDetailsButton;
    }

    /**
     * Refresh UI when admin data changes.
     */
    public void refreshData() {

        collegeNameLabel.setText("College Name: " + admin.getCollagename());
        addressLabel.setText("Address: " + admin.getAddress());
        emailLabel.setText("Email: " + admin.getEmailid());
        contactLabel.setText("Contact: " + admin.getContactnumber());
        websiteLabel.setText("Website: " + admin.getWebsite());
        lastLoginLabel.setText("Last Login: " + admin.getLastlogin());
    }
}
