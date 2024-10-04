# E-commerce AutoAI Web Application
![home page](https://github.com/user-attachments/assets/c64cc01e-d60b-4607-814d-16ebabbd36fd)

## About the Project
The AutoAI project focuses on automating artificial intelligence processes to enhance predictive modeling in e-commerce. By integrating Bayesian Optimization and Neural Architecture Search (NAS), it aims to improve stock sales prediction accuracy while streamlining model development. This project showcases automated feature engineering, demonstrating how AI can be applied effectively in real-world scenarios, ultimately reducing manual intervention and improving decision-making.

### Built With
![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![JavaScript](https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=%F7DF1E)
![Flask](https://img.shields.io/badge/Flask-%23000000.svg?style=for-the-badge&logo=flask&logoColor=white)
![Python](https://img.shields.io/badge/python-%23239B9A.svg?style=for-the-badge&logo=python&logoColor=white)
![SQL](https://img.shields.io/badge/SQL-%234F5B93.svg?style=for-the-badge&logo=sqlite&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-%23339933.svg?style=for-the-badge&logo=node.js&logoColor=white)

## Getting Started
### User Prerequisites
- NodeJS
- MySQL Database

### User Installation
1. Clone this repository to your local machine.
2. Navigate to the server directory and start the Flask server:
   ```bash
   cd server && flask run
3. In a new terminal, navigate to the frontend React application directory and launch the application:
   ```bash
   cd data_analytic && npm start

## Usage
User could upload the dataset and the web application would generate store the best model suited towards the dataset uploaded by the user, Hence the name AUTOAI!

<div align="center"><img src="https://github.com/user-attachments/assets/6de1c1ef-76b5-41b1-a604-be854f746a25" alt="Description" width="800" /></div>

### Data Upload Page
The data upload page allows users to upload datasets via file upload or drag-and-drop. Users select a prediction column and click ‘Upload and Predict,’ sending the dataset to the Flask server for feature engineering and model generation using the NAS algorithm.

<img src="https://github.com/user-attachments/assets/02a75fe5-acef-42a5-bfef-fba8ebc9b481" alt="Description" width="500" />
<img src="https://github.com/user-attachments/assets/3788b44a-0e8b-4562-a618-327daff3689e" alt="Description" width="500" />

### Predictive Insights Page
The model details are retrieved using the generated model ID stored in the database. This information is accessed via a REST API and displayed in the UI for evaluation. Users can generate predictions by selecting input features and submitting a request, which sends the data through the Flask server to access the best model linked to the dataset's model ID.

<div align="center">
<img src="https://github.com/user-attachments/assets/3c1f0f11-63c3-4b45-ab41-7d7c56738e43" alt="Picture4" width="500" /><br>
<img src="https://github.com/user-attachments/assets/64180ca6-6f5b-4d86-8d07-01a364efdb8e" alt="Picture5" width="500" />
</div>

### Charts and Diagram UI
The charts and diagram UI visualizes data using various chart types from the MUI X library, allowing users to explore their datasets with bar, line, and pie charts. This interface processes data to generate accurate visualizations, helping users identify trends and patterns for informed business decisions.

<div align="center">
<img src="https://github.com/user-attachments/assets/74123de8-3e05-4bec-b039-0ccdbceab230" alt="autoAI_charts" />
</div>

## Database Integration
The models that are generated are stored inside the SQL along with its evaluation metrics

### ERD Diagram:
![ERD](https://github.com/user-attachments/assets/1a167b6b-36d2-41f5-ab47-bd234c3763f9)

## Limitation

The AutoAI application has notable limitations, including the need for user expertise to interpret model metrics, which can impact predictive insights. Its performance relies heavily on the quality of input datasets, with low-quality data resulting in suboptimal predictions. Additionally, the application requires more computational resources and lacks customization options, hindering flexibility. Lastly, scalability issues may arise as data volumes increase, necessitating improvements to maintain efficiency and accuracy across various data sizes.

## Project Advisor
- Dr. Chu Yih Bing
