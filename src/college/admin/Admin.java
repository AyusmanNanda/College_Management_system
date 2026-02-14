package college.admin;

/**
 * Admin model class.
 *
 * This class represents an Admin entity in the system.
 * It is purely a data holder (POJO).
 *
 * Keeping data separate from UI improves maintainability
 * and allows easy scalability in future.
 */
public class Admin {

    private String id;
    private String name;
    private String email;
    private String phone;
    private String designation;

    /**
     * Constructor to initialize Admin object.
     */
    public Admin(String id, String name, String email, String phone, String designation) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.phone = phone;
        this.designation = designation;
    }

    // Getters

    public String getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getEmail() {
        return email;
    }

    public String getPhone() {
        return phone;
    }

    public String getDesignation() {
        return designation;
    }

    // Setters

    public void setName(String name) {
        this.name = name;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public void setDesignation(String designation) {
        this.designation = designation;
    }
}
