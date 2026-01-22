package college.login;

import java.awt.Color;
import java.awt.Font;
import javax.swing.JLabel;
import javax.swing.JPanel;
import javax.swing.SwingConstants;
import javax.swing.border.LineBorder;

class LoginPanel extends JPanel {

    private static final Color THEME_BLUE = new Color(39, 71, 122);

    private String loginProfile;
    private JLabel titleLabel;

    LoginPanel(String loginProfile) {
        this.loginProfile = loginProfile;

        // Panel configuration
        setLayout(null);
        setBackground(new Color(0, 0, 0, 80));
        setBorder(new LineBorder(THEME_BLUE));

        // Panel title
        titleLabel = new JLabel(loginProfile + " Login");
        titleLabel.setForeground(Color.WHITE);
        titleLabel.setFont(new Font("Segoe UI", Font.BOLD, 22));
        titleLabel.setHorizontalAlignment(SwingConstants.CENTER);
        titleLabel.setBounds(0, 40, 400, 40);
        add(titleLabel);
    }
}
