import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-light p-8 mt-auto">
      <div className="container mx-auto text-center text-dark-brand">
        <p>&copy; {new Date().getFullYear()} NicheMind — PainRadar. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
