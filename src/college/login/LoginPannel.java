package college.login;

import java.awt.Color;
import java.awt.Graphics;
import java.awt.Graphics2D;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;

import javax.swing.JButton;
import javax.swing.JLabel;
import javax.swing.JOptionPane;
import javax.swing.JPanel;
import javax.swing.JPasswordField;
import javax.swing.JTextField;
import javax.swing.SwingConstants;
import javax.swing.border.EmptyBorder;
import javax.swing.border.LineBorder;

import college.admin.AdminData;
import college.admin.AdminMain;

import college.student.StudentData;
import college.student.StudentMain;

import college.faculty.FacultyData;
import college.faculty.FacultyMain;
import college.libs.UITheme;

/*
 * Common login panel for Admin / Faculty / Student.
 * This class only handles input and button clicks.
 */
class LoginPanel extends JPanel implements ActionListener {
    // UI
    private JLabel titleLabel;
    private JTextField userIdField;
    private JPasswordField passwordField;
    private JButton loginButton;

    // Parent frame reference
    private LoginPageFrame loginPageFrame;

    // Constructor used by LoginPageFrame
    LoginPanel(LoginPageFrame frame) {

        this.loginPageFrame = frame;

        setLayout(null);
        setOpaque(false);
        setBorder(new LineBorder(UITheme.PRIMARY_BLUE));

        titleLabel = new JLabel("College Login");
        titleLabel.setForeground(Color.WHITE);
        titleLabel.setFont(UITheme.HEADER_FONT);
        titleLabel.setHorizontalAlignment(SwingConstants.CENTER);
        add(titleLabel);

        userIdField = new JTextField();
        userIdField.setFont(UITheme.HEADER_FONT);
        userIdField.setBorder(new EmptyBorder(0, 8, 0, 0));
        add(userIdField);

        passwordField = new JPasswordField();
        passwordField.setFont(UITheme.HEADER_FONT);
        passwordField.setBorder(userIdField.getBorder());
        add(passwordField);

        loginButton = new JButton("Login");
        loginButton.setFont(UITheme.HEADER_FONT);
        loginButton.setForeground(Color.WHITE);
        loginButton.setBackground(UITheme.PRIMARY_BLUE);
        loginButton.setFocusable(false);
        loginButton.setBorderPainted(false);
        loginButton.addActionListener(this);
        add(loginButton);
    }

    // Called by LoginPageFrame
    void updateLayout(int panelWidth, int panelHeight) {

        int fieldWidth = 260;
        int fieldHeight = 40;
        int centerX = (panelWidth - fieldWidth) / 2;

        titleLabel.setBounds(0, 40, panelWidth, 40);
        userIdField.setBounds(centerX, 120, fieldWidth, fieldHeight);
        passwordField.setBounds(centerX, 180, fieldWidth, fieldHeight);
        loginButton.setBounds(centerX, 240, fieldWidth, fieldHeight);
    }

    // Login button click
    @Override
    public void actionPerformed(ActionEvent e) {

        String userid = userIdField.getText().trim();
        String password = new String(passwordField.getPassword()).trim();

        if (userid.isEmpty() || password.isEmpty()) {
            JOptionPane.showMessageDialog(
                    this,
                    "Enter userid and password",
                    "Login Error",
                    JOptionPane.WARNING_MESSAGE
            );
            return;
        }

        AdminData adminData = new AdminData();
        boolean adminResult = adminData.checkPassword(userid, password);

        if (adminResult) {
            System.out.println("Hello Admin");

            if (loginPageFrame != null) {
                loginPageFrame.dispose();
            }

            AdminMain adminMain = new AdminMain();
            adminMain.setVisible(true);
            return;
        }

        FacultyData facultyData = new FacultyData();
        boolean facultyResult = facultyData.checkPassword(userid, password);

        if (facultyResult) {
            System.out.println("Hello Faculty");

            if (loginPageFrame != null) {
                loginPageFrame.dispose();
            }

            FacultyMain facultyMain = new FacultyMain();
            facultyMain.setVisible(true);
            return;
        }

        StudentData studentData = new StudentData();
        boolean studentResult = studentData.checkPassword(userid, password);

        if (studentResult) {
            System.out.println("Hello Student");

            if (loginPageFrame != null) {
                loginPageFrame.dispose();
            }

            StudentMain studentMain = new StudentMain();
            studentMain.setVisible(true);
            return;
        }

        JOptionPane.showMessageDialog(
                this,
                "Invalid credentials",
                "Login Failed",
                JOptionPane.ERROR_MESSAGE
        );
    }

    // Translucent panel background
    @Override
    protected void paintComponent(Graphics g) {

        Graphics2D g2 = (Graphics2D) g.create();
        g2.setColor(new Color(0, 0, 0, 80));
        g2.fillRect(0, 0, getWidth(), getHeight());
        g2.dispose();

        super.paintComponent(g);
    }
}
