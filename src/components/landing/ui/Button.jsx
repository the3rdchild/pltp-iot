import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

import { ArrowRightIcon } from '../icons';
import styles from './Button.module.css';

// Internal routes go through react-router so the SPA never does a full reload;
// anything else (in-page anchors, external) stays a plain anchor.
const isRouterTarget = (href) => href?.startsWith('/') && !href.startsWith('//');

export function Button({ href, variant = 'primary', children, ...rest }) {
  const className = `${styles.base} ${styles[variant]}`;

  if (isRouterTarget(href)) {
    return (
      <Link to={href} className={className} {...rest}>
        {children}
      </Link>
    );
  }

  return (
    <a href={href} className={className} {...rest}>
      {children}
    </a>
  );
}

Button.propTypes = {
  href: PropTypes.string.isRequired,
  variant: PropTypes.oneOf(['primary', 'secondary', 'onDark']),
  children: PropTypes.node
};

export function ArrowLink({ href, children, onDark = false, ...rest }) {
  const className = `${styles.link} ${onDark ? styles.linkOnDark : ''}`;
  const content = (
    <>
      {children}
      <ArrowRightIcon size={14} />
    </>
  );

  if (isRouterTarget(href)) {
    return (
      <Link to={href} className={className} {...rest}>
        {content}
      </Link>
    );
  }

  return (
    <a href={href} className={className} {...rest}>
      {content}
    </a>
  );
}

ArrowLink.propTypes = {
  href: PropTypes.string.isRequired,
  children: PropTypes.node,
  onDark: PropTypes.bool
};
