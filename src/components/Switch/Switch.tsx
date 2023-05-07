import styles from "./Switch.module.scss";
import classNames from "classnames";

interface Props {
  checked: boolean;
  onChange?: (checked: boolean) => void;
}

function Switch({ checked, onChange }: Props) {
  const handleClick = () => {
    onChange && onChange(!checked);
  };

  return (
    <div
      className={classNames(styles.switch, checked && styles.checked)}
      onClick={handleClick}
    />
  );
}

export default Switch;
