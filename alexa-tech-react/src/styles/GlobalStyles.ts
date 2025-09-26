import styled, { createGlobalStyle } from 'styled-components';

export const GlobalStyles = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap');
  @import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css');

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: 'Roboto', sans-serif;
    background-color: #f0f2f5;
    color: #333;
  }

  a {
    text-decoration: none;
    color: inherit;
  }

  button {
    border: none;
    cursor: pointer;
    font-family: inherit;
  }

  input, select, textarea {
    font-family: inherit;
  }
`;

export const DashboardContainer = styled.div`
  display: flex;
  height: 100vh;
`;

export const MainContent = styled.main`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

export const MainHeader = styled.header`
  background-color: #fff;
  padding: 20px 30px;
  border-bottom: 1px solid #e0e0e0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;

  h1 {
    font-size: 28px;
    font-weight: 700;
    color: #333;
    margin: 0;
  }
`;

export const ContentBody = styled.div`
  flex: 1;
  padding: 30px;
  overflow-y: auto;
`;