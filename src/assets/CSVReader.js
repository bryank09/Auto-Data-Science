import React, { useState, useRef, useEffect } from 'react';
import { PrimeReactProvider } from "primereact/api";
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { PieChart, pieArcLabelClasses } from '@mui/x-charts';
import { BarChart } from '@mui/x-charts/BarChart';
import Container from 'react-bootstrap/Container';
import { LineChart } from '@mui/x-charts';
import { FaRegImage } from "react-icons/fa";
import axios from 'axios';
import { useLocation } from 'react-router-dom';

const UploadFile = () => {
  const [file, setFile] = useState(null);
  const fileInputRef = useRef(null);

  //retrieve input from user
  const handleFileChange = (e) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleDivClick = () => {
    fileInputRef.current.click();
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    event.stopPropagation();
    event.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();
    const droppedFile = event.dataTransfer.files[0];
    setFile(droppedFile);
  };

  const [data, setData] = useState([]);
  const [columns, setColumns] = useState([]);

  const [uploadModal, setUploadModal] = useState(false);
  const [modelkey, setModelKey] = useState();
  const [predictedVal, setPredictedVal] = useState("empty");
  const [tableColumns, setTableColumns] = useState([]);
  const [selectedColumn, setSelectedColumn] = useState(null);

  const [inputTemplate, setInputTemplate] = useState({});
  const [inputValues, setInputValues] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [modelDetails, setModelDetails] = useState({});

  const location = useLocation();
  useEffect(() => {
    const fetchModelId = async () => {
      // Extract model_id from URL query parameters
      const queryParams = new URLSearchParams(location.search);
      const id = queryParams.get('key');

      if (id) {
        setModelKey(id);
      }else{
        setModelKey(null)
      }
    };

    fetchModelId();
  }, [location.search]);

  useEffect(() => {
    fetch('http://localhost:5000/model_details', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        "model_id": modelkey 
      })
    })
      .then(response => response.json())
      .then(responseData => {
        setModelDetails(responseData);
        //setModelKey(responseData.model_id)
      })
      .catch(error => console.error('Error:', error));
  }, [modelkey]);

  const setTableData = (csvData, csvHeaders) => {
    setData(csvData);

    const generatedColumns = csvHeaders.map((header, index) => (
      <Column key={index} field={header} header={header} />
    ));
    setColumns(generatedColumns);
  };

  useEffect(() => {
    const columnTypes = {};
    const tempHolder = {};
    const processFile = async () => {
      if (file) {
        try {
          const fileUrl = URL.createObjectURL(file);
          const response = await fetch(fileUrl);
          const text = await response.text();
          const lines = text.split('\n');
          const headers = lines[0].split(',');
          const data = [];

          const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
          const timeRegex = /^\d{2}:\d{2}:\d{2}$/;

          const firstDataRow = lines[1].split(',');
          firstDataRow.forEach((value, index) => {
            const header = headers[index];
            if (dateRegex.test(value)) {
              columnTypes[header] = 'date';
            } else if (timeRegex.test(value)) {
              columnTypes[header] = 'time';
            } else if (!isNaN(parseFloat(value))) {
              if (!isNaN(parseInt(value))) {
                columnTypes[header] = 'integer';
              } else {
                columnTypes[header] = 'float';
              }
            }

            tempHolder[header] = {
              type: columnTypes[header],
              value: value
            };
          });

          for (let i = 1; i < lines.length; i++) {
            const line = lines[i].split(',');
            const item = {};
            headers.forEach((header, index) => {
              item[header] = line[index];
            });
            data.push(item);
          }

          setTableData(data, headers);
          handleShow();
        } catch (error) {
          console.error(error);
        }
      }
    };
    processFile();
    setTableColumns(tempHolder);
  }, [file]);

  const handleClose = () => setUploadModal(false);
  const handleShow = () => setUploadModal(true);

  const sendCSVFile = (e) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('selectedColumn', selectedColumn);
    formData.append('inputs', JSON.stringify(tableColumns));

    fetch('http://localhost:5000/file-upload', {
      method: 'POST',
      body: formData,
    }).then(response => response.json())
      .then(data => {
        setModelKey(data.model_key);
        setIsLoading(false);
      })
      .catch(error => {
        console.error('Error:', error)
        setIsLoading(false);
      });
  };

  const handleSelectChange = (event) => {
    setSelectedColumn(event.target.value);
  };

  return (
    <>
      {modelkey ? (<ModelPredictions modelkey={modelkey} modelDetails={modelDetails} />) :
        (<>
          <h2>Import CSV File!</h2>
          <div className={'doc-upload d-flex flex-column align-items-center'}
            onClick={handleDivClick}
            onDragOver={handleDragOver}
            onDrop={handleDrop}>
            <FaRegImage size={'15em'} />
            <p>Upload Your Dataset!</p>
            <input
              type="file"
              accept=".csv"
              ref={fileInputRef}
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
          </div>
          <Modal show={uploadModal} onHide={handleClose} size="lg" aria-labelledby="contained-modal-title-vcenter" centered dialogClassName="custom-modal-width" backdrop='static' keyboard={false}>
            <Modal.Header closeButton>
              <Modal.Title>Upload Data</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              {isLoading ?
                <div className="d-flex flex-column align-items-center">
                  <div className="spinner"></div>
                  <p>Training your model...</p>
                </div>
                :
                <div>
                  <div className="d-flex gap-2">
                    <label htmlFor="columnSelect">Select Column To Predict:  </label>
                    <select id="columnSelect" value={selectedColumn} onChange={handleSelectChange}>
                      <option value="" disabled>Select a column</option>
                      {tableColumns ? Object.keys(tableColumns).map((column) => (
                        <option key={column} value={column}>{column}</option>
                      )) : <option>Missing Column</option>}
                    </select>
                  </div>
                  <PrimeReactProvider>
                    <DataTable value={data} paginator showGridlines rows={5} tableStyle={{ minWidth: '50rem' }}>
                      {columns}
                    </DataTable>
                  </PrimeReactProvider>
                </div>
              }
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={handleClose}>
                CANCEL
              </Button>
              <Button variant="primary" onClick={sendCSVFile}>
                UPLOAD & PREDICT
              </Button>
            </Modal.Footer>
          </Modal>
        </>)
      }
    </>
  )
}

const ModelPredictions = ({ modelkey, modelDetails }) => {
  const [columns, setColumns] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [inputTemplate, setInputTemplate] = useState([]);
  const [inputValues, setInputValues] = useState({});
  const [predictedVal, setPredictedVal] = useState("PREDICT YOUR DATA!");

  useEffect(() => {
    fetch('http://localhost:5000/table_data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        "model_id": modelkey 
      })
    })
      .then(response => response.json())
      .then(data => {
        const generatedColumns = data.header.field_names.map((header, index) => (
          <Column key={index} field={header} header={header} />
        ));

        const combinedTemplate = data.header.field_names.reduce((obj, fieldName, index) => {
          obj[fieldName] = data.header.field_type[index];
          return obj;
        }, {});

        setColumns(generatedColumns);
        setTableData(data.data);
        setInputTemplate(combinedTemplate);
        setPredictedVal("PREDICT YOUR DATA!")
        const firstRowValues = data.data[0];
        const initialValues = Object.keys(firstRowValues).reduce((obj, key) => {
          obj[key] = firstRowValues[key];
          return obj;
        }, {});
        setInputValues(initialValues);
      })
      .catch(error => console.error('Error:', error));
  }, [modelkey]);

  const handleChange = (key, value) => {
    setInputTemplate(prevState => ({
      ...prevState,
      [key]: {
        ...prevState[key],
        value: value,
      }
    }));
  };

  const predictValue = (modelKey) => {
    const input_data = Object.keys(inputTemplate).reduce((obj, key) => {
      obj[key] = {
        type: inputTemplate[key],
        value: inputValues[key]
      };
      return obj;
    }, {});
    try {
      fetch('http://localhost:5000/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model_key: modelKey,
          input_data: input_data
        })
      }).then(response => response.json())
        .then(data => {
          setPredictedVal(data.predictions);
        })
        .catch(error => console.error('Error:', error));
    } catch (error) {
      console.error('There was an error with the prediction request:', error);
    }
  };
  return (
    <>
      <Container id="prediction-container">
        <Row className="section">
          <h3>DATASET</h3>
          <PrimeReactProvider>
            <DataTable value={tableData} paginator showGridlines rows={5} tableStyle={{ minWidth: '50rem' }}>
              {columns}
            </DataTable>
          </PrimeReactProvider>
        </Row>
        <Row className="section">
          <h3>MODEL METRICS</h3>
          {Object.entries(modelDetails).map(([key, value]) => (
            <Col xs={6}>
              <div key={key} className="info-group">
                <div className="info-group-label">{key}:</div>
                <div className="info-group-value">{value}</div>
              </div>
            </Col>
          ))}
        </Row>
        <Row className="section">
          <h3>PREDICT YOUR DATA!</h3>
          {Object.keys(inputTemplate).map((key) => {
            if (key !== modelDetails.predicted_column) {
              let inputType;
              switch (inputTemplate[key]) {
                case "TIME":
                  inputType = "time";
                  break;
                case "DATE":
                  inputType = "date";
                  break;
                case "LONG":
                case "FLOAT":
                  inputType = "number";
                  break;
                default:
                  inputType = "text";
              }
              return (
                <Col key={key} xs={6} className='d-flex mb-1'>
                  <Col xs={5} style={{ display: "flex", alignItems: "center" }}>
                    <label htmlFor={key} style={{ display: 'block', fontWeight: 'bold' }}>{key}:</label>
                  </Col>
                  <Col xs={7}>
                    <input
                      id={key}
                      type={inputType}
                      value={inputValues[key]}
                      onChange={(e) => handleChange(key, e.target.value)}
                      style={{ width: '100%', padding: '0.5rem', borderRadius: '0.25rem', border: '1px solid #ced4da' }}
                    />
                  </Col>
                </Col>
              );
            }
          })}
          <button id="predict-button" className='mb-3 mt-3' onClick={() => predictValue(modelDetails.model_id)}>PREDICT!</button>
          <Col xs={6}>
            <div className="info-group">
              <div className="info-group-label">{modelDetails.predicted_column}:</div>
              <div className="info-group-value">{predictedVal}</div>
            </div>
          </Col>
        </Row>
        <Row className="section">
          <ChartGenerator />
        </Row>
      </Container>
    </>
  )
}

const CSVReader = () => {
  const [data, setData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [tempColumns, setTempColumns] = useState([]);

  const handleFileChange = (csvData, csvHeaders) => {
    setData(csvData);

    const generatedColumns = csvHeaders.map((header, index) => (
      <Column key={index} field={header} header={header} />
    ));
    setTempColumns(csvHeaders);
    setColumns(generatedColumns);
  };

  const [flaskData, setFlaskData] = useState({
    name: "",
    age: 0,
    date: "",
    programming: "",
  });

  const retrieveData = () => {
    fetch("/data").then((res) =>
      res.json().then((data) => {
        // Setting a data from api
        setFlaskData({
          name: data.Name,
          age: data.Age,
          date: data.Date,
          programming: data.programming,
        });
      })
    );
  }

  return (
    <div>
      <UploadFile />
      {/* <CSVSelector onChange={handleFileChange} data={data} tempColumns={tempColumns} /> */}
      {/* <PrimeReactProvider>
        <DataTable value={data} paginator showGridlines rows={5} tableStyle={{ minWidth: '50rem' }}>
          {columns}
        </DataTable>
      </PrimeReactProvider> */}
    </div>
  );
}

const ChartGenerator = (data) => {
  const uData = [4000, 3000, 2000, 2780, 1890, 2390, 3490];
  const pData = [2400, 1398, 9800, 3908, 4800, 3800, 4300];
  const xLabels = [
    'Page A',
    'Page B',
    'Page C',
    'Page D',
    'Page E',
    'Page F',
    'Page G',
  ];
  const [salescategories, setSalesCategories] = useState([]);
  const [lineChartData, setLineChartData] = useState(null);
  const [chartTopData, setChartTopData] = useState(null);
  const [paymentMethodData, setPaymentMethodData] = useState(null);
  useEffect(() => {
    fetch('http://localhost:5000/piechart', {
      method: 'GET'
    })
      .then(response => response.json())
      .then(data => {
        setSalesCategories(data);
      })
      .catch(error => console.error('Error:', error));
    fetch('http://localhost:5000/linechart', {
      method: 'GET'
    })
      .then(response => response.json())
      .then(data => {
        setLineChartData(data)
      })
      .catch(error => console.error('Error:', error));

    fetch('http://localhost:5000/get_top_result', {
      method: 'GET'
    })
      .then(response => response.json())
      .then(data => {
        setChartTopData(data)
      })
      .catch(error => console.error('Error:', error));
    fetch('http://localhost:5000/payment_method', {
      method: 'GET'
    })
      .then(response => response.json())
      .then(data => {
        setPaymentMethodData(data)
      })
      .catch(error => console.error('Error:', error));
  }, []);

  const pieChartProps = {
    series: [
      {
        id: 'sync',
        data: salescategories,
        highlightScope: { highlighted: 'item', faded: 'global' },
      },
    ],
    slotProps: {
      legend: {
        position: { vertical: 'middle', horizontal: 'right' },
      },
    },
  };
  return (
    <Container id="chart-background">
      <Row>
        <Col className="chart-background_section" xs={4}>
          <label style={{ display: 'block', fontWeight: 'bold', fontSize: 25 }}>Top Sold Product</label>
          <PieChart
            {...pieChartProps}
            width={400}
            height={200}
            margin={{ right: 200 }}
          />
        </Col>
        <Col className="chart-background_section" xs={8}>
          <label style={{ display: 'block', fontWeight: 'bold', fontSize: 25 }}>Monthly Sales</label>
          {lineChartData ? <LineChart
            xAxis={[{
              id: lineChartData.xAxis.id,
              label: lineChartData.xAxis.label,
              data: lineChartData.xAxis.data,
              showLine: true
            }]}
            yAxis={[{
              valueFormatter: (value) => `$${value}`,
              showLine: true
            }]}
            series={[
              lineChartData.yAxis.sales,
              lineChartData.yAxis.profit,
            ]}
            margin={{left: 80}}
            width={500}
            height={300}
          /> : <div>Loading...</div>}
        </Col>
      </Row>
      <Row>
        <Col className="chart-background_section" xs={4}>
          <label style={{ display: 'block', fontWeight: 'bold', fontSize: 25 }}>Top 3 Profitable Product</label>
          {chartTopData ?
            <BarChart
              width={450}
              height={200}
              series={[
                { data: chartTopData.top_product.data },
              ]}
              xAxis={[{ data: chartTopData.top_product.label, scaleType: 'band', label: "Product" }]}
              margin={{ left: 80 }}
            /> : <div>Loading...</div>}
        </Col>
        <Col className="chart-background_section" xs={4}>
          <label style={{ display: 'block', fontWeight: 'bold', fontSize: 25 }}>Top 3 Customer Aging</label>
          {chartTopData ?
            <BarChart
              width={450}
              height={200}
              series={[
                { data: chartTopData.top_age.data },
              ]}
              xAxis={[{ data: chartTopData.top_age.label, scaleType: 'band', label: "Age" }]}
              margin={{ left: 80 }}
            /> : <div>Loading...</div>}
        </Col>
        <Col className="chart-background_section" xs={4}>
          <label style={{ display: 'block', fontWeight: 'bold', fontSize: 25 }}>Top Payment Method</label>
          {paymentMethodData ?
            <BarChart
              width={450}
              height={200}
              series={[
                { data: paymentMethodData.data },
              ]}
              xAxis={[{ data: paymentMethodData.label, scaleType: 'band', label: "Payment Method" }]}
              // yAxis={[{
              //   label: 'Total',
              //   labelStyle: {
              //     transform: 'translateX(-20px)',
              //   },
              //   // valueFormatter: (value) => `$${value}`
              // }]}
              margin={{ left: 80 }}
            /> : <div>Loading...</div>}
        </Col>
      </Row>
      <Row className="chart-background_section">
      </Row>
    </Container>
  )
};

export default CSVReader;