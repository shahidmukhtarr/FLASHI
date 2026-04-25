'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function SalesNavLink({ className, style, onClick, isAnchor }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (localStorage.getItem('flashi_user')) {
      setShow(true);
    }
  }, []);


  if (isAnchor) {
    return (
      <a href="/special-discounts" className={className} onClick={onClick} style={style}>
        Sales
      </a>
    );
  }

  return (
    <Link href="/special-discounts" className={className} onClick={onClick} style={style}>
      Sales
    </Link>
  );
}
