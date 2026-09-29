import { Link } from 'react-router-dom';

export default function HeaderExampleTab() {
  return (
    <Link
      to="/example"
      className="base-header-link"
    >
      Demo
    </Link>
  );
}
