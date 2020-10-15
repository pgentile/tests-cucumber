import PropTypes from "prop-types";
import { memo } from "react";
import { default as BootstrapButton } from "react-bootstrap/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

function Button({ icon, iconOnly = false, children, ...otherProps }) {
  return (
    <BootstrapButton {...otherProps}>
      {icon && <FontAwesomeIcon icon={icon} className={`mr-${iconOnly ? 0 : 2}`} />}
      {iconOnly && <span className="sr-only">{children}</span>}
      {!iconOnly && children}
    </BootstrapButton>
  );
}

Button.propTypes = {
  ...BootstrapButton.propTypes,
  icon: PropTypes.object,
  iconOnly: PropTypes.bool
};

export default memo(Button);
