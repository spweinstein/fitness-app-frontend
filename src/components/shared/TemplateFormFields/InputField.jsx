const InputField = ({
  label,
  name,
  type = "text",
  value,
  onChange,
  required,
  min,
  step,
  placeholder,
}) => (
  <div style={{ marginBottom: "16px" }}>
    <label
      htmlFor={name}
      style={{
        display: "block",
        fontSize: "14px",
        fontWeight: "600",
        color: "#333",
        marginBottom: "4px",
      }}
    >
      {label}
      {required && <span style={{ color: "#c33", marginLeft: "4px" }}>*</span>}
    </label>
    <input
      type={type}
      id={name}
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      min={min}
      step={step}
      placeholder={placeholder}
      style={{
        width: "100%",
        padding: "8px 12px",
        border: "1px solid #ddd",
        borderRadius: "4px",
        fontSize: "14px",
        fontFamily: "inherit",
      }}
      onFocus={(e) => {
        e.target.style.outline = "none";
        e.target.style.borderColor = "#2196F3";
        e.target.style.boxShadow = "0 0 0 2px rgba(33, 150, 243, 0.2)";
      }}
      onBlur={(e) => {
        e.target.style.borderColor = "#ddd";
        e.target.style.boxShadow = "none";
      }}
    />
  </div>
);

export default InputField;
