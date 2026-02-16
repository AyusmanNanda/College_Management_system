package college.admin;

import college.libs.ApplicationWindow;
import college.libs.UITheme;

import javax.swing.*;
import java.awt.*;

/**
 * EditAdminDetailsDialog allows editing of
 * college information stored in admin table.
 */
public class EditAdminDetailsDialog extends JDialog {

    private Admin admin;
    private AdminProfilePanel profilePanel;

    private JTextField collegeNameField;
    private JTextField addressField;
    private JTextField emailField;
    private JTextField contactField;
    private JTextField websiteField;

    public EditAdminDetailsDialog(ApplicationWindow parent,
                                  Admin admin,
                                  AdminProfilePanel profilePanel) {

        super(parent, "Edit College Details", true);

        this.admin = admin;
        this.profilePanel = profilePanel;

        initializeDialog();
    }

    private void initializeDialog() {

        setSize(450, 350);
        setLocationRelativeTo(getParent());

        JPanel rootPanel = new JPanel(new BorderLayout());
        rootPanel.setBackground(UITheme.BACKGROUND_WHITE);
        rootPanel.setBorder(BorderFactory.createEmptyBorder(20, 25, 20, 25));

        JPanel formPanel = new JPanel(new GridLayout(5, 2, 10, 15));
        formPanel.setBackground(UITheme.BACKGROUND_WHITE);

        collegeNameField = createTextField(admin.getCollagename());
        addressField = createTextField(admin.getAddress());
        emailField = createTextField(admin.getEmailid());
        contactField = createTextField(admin.getContactnumber());
        websiteField = createTextField(admin.getWebsite());

        formPanel.add(createLabel("College Name"));
        formPanel.add(collegeNameField);

        formPanel.add(createLabel("Address"));
        formPanel.add(addressField);

        formPanel.add(createLabel("Email"));
        formPanel.add(emailField);

        formPanel.add(createLabel("Contact"));
        formPanel.add(contactField);

        formPanel.add(createLabel("Website"));
        formPanel.add(websiteField);

        JButton saveButton = new JButton("Save");
        saveButton.setFont(new Font("Segoe UI", Font.PLAIN, 13));
        saveButton.setBackground(UITheme.PRIMARY_BLUE);
        saveButton.setForeground(Color.WHITE);
        saveButton.setFocusPainted(false);

        JPanel buttonPanel = new JPanel(new FlowLayout(FlowLayout.RIGHT));
        buttonPanel.setBackground(UITheme.BACKGROUND_WHITE);
        buttonPanel.add(saveButton);

        rootPanel.add(formPanel, BorderLayout.CENTER);
        rootPanel.add(buttonPanel, BorderLayout.SOUTH);

        add(rootPanel);

        saveButton.addActionListener(e -> saveChanges());
    }

    private JLabel createLabel(String text) {
        JLabel label = new JLabel(text);
        label.setFont(new Font("Segoe UI", Font.PLAIN, 14));
        return label;
    }

    private JTextField createTextField(String value) {
        JTextField field = new JTextField(value);
        field.setFont(new Font("Segoe UI", Font.PLAIN, 13));
        return field;
    }

    /**
     * Updates admin object locally and refreshes UI.
     * (Database update logic should be added later)
     */
    private void saveChanges() {

        // Update existing admin object (do NOT create new object)
        admin.setCollagename(collegeNameField.getText());
        admin.setAddress(addressField.getText());
        admin.setEmailid(emailField.getText());
        admin.setContactnumber(contactField.getText());
        admin.setWebsite(websiteField.getText());

        AdminData adminData = new AdminData();
        boolean success = adminData.updateAdminDetails(admin);

        if (success) {
            profilePanel.refreshData();
            dispose();
        } else {
            JOptionPane.showMessageDialog(
                    this,
                    "Failed to update details.",
                    "Error",
                    JOptionPane.ERROR_MESSAGE
            );
        }
    }


}
