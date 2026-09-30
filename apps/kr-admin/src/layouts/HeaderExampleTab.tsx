import { NavLink } from 'react-router-dom';

export default function HeaderExampleTab() {
  return (
    <NavLink
      to="/example"
      className={({ isActive }) => `base-header-link header-example-tab${isActive ? ' is-active' : ''}`}
    >
      Demo
    </NavLink>
  );
}
