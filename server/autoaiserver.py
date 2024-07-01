from flask import Flask,render_template, request,jsonify
from flask_cors import CORS, cross_origin
import numpy as np
from keras.models import Model
from keras.layers import Input, Dense, Dropout, Flatten
from tensorflow.keras.optimizers import Adam
from keras.datasets import mnist
from tensorflow.keras.utils import to_categorical
import pandas as pd
from bayes_opt import BayesianOptimization
from sklearn.model_selection import train_test_split
from keras.models import Sequential, model_from_json
from keras.layers import Dense, Dropout
import numpy as np
import pandas as pd
from sklearn.linear_model import LinearRegression
from scipy.stats import pearsonr
from sklearn.metrics import r2_score, mean_absolute_error, mean_squared_error
import pickle
import io
import mysql.connector
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
import traceback
from keras.regularizers import l1_l2, l2
from keras.callbacks import EarlyStopping
import json
from datetime import timedelta
import datetime
from mysql.connector import FieldType
import random
import string

app = Flask(__name__)
CORS(app)

def auto_fe(X_train, X_test, y_train, numerical_features, categorical_features):
    # numerical_features = ['Aging', 'Customer_Id', 'Quantity', 'Discount', 'Profit', 'Shipping_Cost']
    # categorical_features = ['Order_Date', 'Time', 'Gender', 'Device_Type', 'Customer_Login_type', 'Product_Category',
    #                         'Product', 'Order_Priority', 'Payment_method']

    # Define the transformers for the numerical and categorical columns
    numerical_transformer = StandardScaler()
    categorical_transformer = OneHotEncoder(handle_unknown='ignore')

    # Create the preprocessing pipeline
    preprocessor = ColumnTransformer(
        transformers=[
            ('num', numerical_transformer, numerical_features),
            ('cat', categorical_transformer, categorical_features)
        ])

    # Fit the preprocessor to your data
    preprocessor.fit(X_train)

    # Transform the data
    X_train = preprocessor.transform(X_train).toarray()
    X_test = preprocessor.transform(X_test).toarray()

    y_train = y_train.values if isinstance(y_train, pd.Series) else y_train
    return X_train, X_test, y_train, preprocessor

def format_columns(data, model_training):
    numerical_headers = []
    categorical_headers = []
    headers = []
    input_values = []

    for key, value in data.items():
        if(key != model_training):
            key = key.strip()
            value_type = value.get('type', 'categorical')
            value_value = value.get('value')

            if value_type in ['integer', 'float']:
                if(model_training):
                    numerical_headers.append(key)
                else:
                    headers.append(key)
                    input_values.append(float(value_value))
            else:
                if(model_training):
                    numerical_headers.append(key)
                else:
                    headers.append(key)
                    input_values.append(value_value)

    if(model_training):
        return categorical_headers, numerical_headers
    return headers, input_values

def generate_model(num_layers, num_neurons, dropout_rate, learning_rate, l1_reg, l2_reg):
    model = Sequential()
    for i in range(int(num_layers)):
        model.add(Dense(int(num_neurons), activation='linear', kernel_regularizer=l1_l2(l1=l1_reg, l2=l2_reg)))
        model.add(Dropout(dropout_rate))
    model.add(Dense(1, activation='linear'))  # Output layer

    # Compile the model with Adam optimizer and learning rate scheduling
    optimizer = Adam(learning_rate=learning_rate)
    model.compile(optimizer=optimizer, loss='mean_squared_error', metrics=['mean_absolute_error'])

    return model

sql_config = {
    'host': "127.0.0.1",
    'user': "root",
    'password': "AdelineOlam2501",
    'database': "autoai"
}

model_storage = {}

def generate_random_string(length=4):
    characters = string.ascii_letters + string.digits
    return ''.join(random.choice(characters) for i in range(length))

def store_data_sql(df, table_name):
    mydb = mysql.connector.connect(**sql_config)
    cursor = mydb.cursor()

    columns = []
    for col_name, col_type in df.dtypes.items():
        if "int" in str(col_type):
            col_type_sql = "INT"
        elif "float" in str(col_type):
            col_type_sql = "FLOAT"
        elif "object" in str(col_type):  # Assuming object type is string
            col_type_sql = "VARCHAR(255)"
        elif "time" in str(col_type):
            col_type_sql = "DATETIME"
        # Add more type mappings as needed
        columns.append(f"{col_name} {col_type_sql}")

    create_table_query = f"CREATE TABLE IF NOT EXISTS {table_name} ({', '.join(columns)})"
    print(create_table_query)
    cursor.execute(create_table_query)

    placeholders = ", ".join(["%s"] * len(df.columns))
    insert_query = f"INSERT INTO {table_name} ({', '.join(df.columns)}) VALUES ({placeholders})"


    dataset = [tuple(row) for _, row in df.iterrows()]

    cursor.executemany(insert_query, dataset)

    mydb.commit()
    cursor.close()
    mydb.close()

    return True

@app.route('/file-upload', methods=['POST'])
@cross_origin(origin='*',headers=['Content-Type'])
def upload_csv():
    uploaded_file = request.files['file']
    y_column = request.form['selectedColumn']
    input_data = json.loads(request.form['inputs'])
    numerical, categorical = format_columns(input_data, y_column)
    table_name = f"Model_{generate_random_string()}"
    if uploaded_file.filename != '':
        try:
            df = pd.read_csv(uploaded_file.stream, encoding='ISO-8859-1')
        except UnicodeDecodeError:
            try:
                df = pd.read_csv(uploaded_file.stream, encoding='utf-8')
            except UnicodeDecodeError:
                df = pd.read_csv(uploaded_file.stream, encoding='cp1252')

        store_data_sql(df, table_name)
        X = df.drop(y_column, axis=1)
        Y = df[y_column]
        X_train, X_test, y_train, y_test = train_test_split(X, Y, test_size=0.2, random_state=42)
        input_shape = X_train.shape[1]

        X_train, X_test, y_train, preprocessor = auto_fe(X_train, X_test, y_train, numerical, categorical)

        def objective_function(num_layers, num_neurons, dropout_rate, learning_rate, l1_reg, l2_reg):
            model = generate_model(num_layers, num_neurons, dropout_rate, learning_rate, l1_reg, l2_reg)
            early_stopping = EarlyStopping(monitor='val_loss', patience=5, restore_best_weights=True)

            history = model.fit(X_train, y_train, validation_split=0.2, epochs=20, batch_size=32, verbose=0,
                                callbacks=[early_stopping])

            validation_loss = min(history.history['val_loss'])
            return -validation_loss

        pbounds = {
            'num_layers': (1, 2),
            'num_neurons': (10, 100),
            'dropout_rate': (0.1, 0.5),
            'learning_rate': (1e-5, 1e-2),
            'l1_reg': (1e-5, 1e-2),
            'l2_reg': (1e-5, 1e-2)
        }

        optimizer = BayesianOptimization(
            f=objective_function,
            pbounds=pbounds,
            random_state=1,
        )

        optimizer.maximize(
            init_points=2,
            n_iter=10,
        )

        best_params = optimizer.max['params']

        final_model = generate_model(
            best_params['num_layers'],
            best_params['num_neurons'],
            best_params['dropout_rate'],
            best_params['learning_rate'],
            best_params['l1_reg'],
            best_params['l2_reg']
        )

        early_stopping = EarlyStopping(monitor='val_loss', patience=5, restore_best_weights=True)
        final_model.fit(X_train, y_train, validation_split=0.2, epochs=20, batch_size=32, verbose=0,
                        callbacks=[early_stopping])

        y_pred = final_model.predict(X_test)

        mae = float(mean_absolute_error(y_test, y_pred))
        mse = mean_squared_error(y_test, y_pred)
        rmse = float(np.sqrt(mse))
        r, _ = pearsonr(y_test, y_pred)
        r2Score = float(r2_score(y_test, y_pred))

        mse = float(mse)
        r = float(r)
        weights = final_model.get_weights()

        # Step 2: Save the architecture as a JSON string
        architecture = final_model.to_json()

        # Step 3: Create a dictionary for the weights and architecture
        model_dict = {
            'weights': weights,
            'architecture': architecture
        }

        model_binary = pickle.dumps(model_dict)
        pickle_preprocessor = pickle.dumps(preprocessor)

        mydb = mysql.connector.connect(**sql_config)
        cursor = mydb.cursor()

        add_model = ("INSERT INTO models "
                        "(user_id, pickle_model, preprocessor, mae, mse, rmse, r, r_square, table_name, predicted_column)"
                        "VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)")
        cursor.execute(add_model, (1, model_binary, pickle_preprocessor, mae, mse, rmse, r, r2Score, table_name, y_column))
        mydb.commit()
        model_id = cursor.lastrowid
        cursor.close()
        mydb.close()

        return jsonify({'model_key': model_id, 'r2': r2Score})
        # return jsonify({'message': 'Model trained and stored in memory'})
    return 'No file uploaded', 400

CORS(app)

@app.route('/predict', methods=['POST'])
@cross_origin(origin='*',headers=['Content-Type'])
def predict():
    model_key = request.json.get('model_key')
    input_data = request.json.get('input_data')
    column_headers, column_values = format_columns(input_data, False)

    mydb = mysql.connector.connect(**sql_config)
    cursor = mydb.cursor()

    query = "SELECT pickle_model, preprocessor FROM models WHERE model_id = %s"
    cursor.execute(query, (model_key,))
    result = cursor.fetchone()

    model_binary = result[0]
    preprocessor = result[1]

    cursor.close()
    mydb.close()

    preprocessor = pickle.loads(preprocessor)
    model_io = io.BytesIO(model_binary)
    model_dict = pickle.load(model_io)

    prediction_df = pd.DataFrame([column_values], columns=column_headers)
    prediction_data = preprocessor.transform(prediction_df).toarray().reshape(1, -1)

    architecture = model_dict['architecture']
    weights = model_dict['weights']

    model = model_from_json(architecture)
    model.set_weights(weights)

    predictions = model.predict(prediction_data)

    response = jsonify({'predictions': predictions.tolist()})
    return response

@app.route('/piechart', methods=['GET'])
@cross_origin(origin='*',headers=['Content-Type'])
def piechart_data():
    mydb = mysql.connector.connect(**sql_config)
    cursor = mydb.cursor()

    cursor.execute("SELECT Product_category, SUM(Sales) from sampled_data GROUP BY Product_category;")
    rows = cursor.fetchall()
    cursor.close()
    mydb.close()

    categories = [{'id': i, 'value': row[1], 'label': row[0]} for i, row in enumerate(rows)]

    return jsonify(categories)

@app.route('/linechart', methods=['GET'])
@cross_origin(origin='*',headers=['Content-Type'])
def linechart_data():
    mydb = mysql.connector.connect(**sql_config)
    cursor = mydb.cursor()

    linechart_query = """
    SELECT 
        EXTRACT(YEAR FROM order_date) AS year,
        EXTRACT(MONTH FROM order_date) AS month,
        SUM(Sales) AS total_sales,
        SUM(Quantity) AS total_quantity,
        AVG(Discount) AS average_discount,
        SUM(Profit) AS total_profit
    FROM 
        sampled_data
    GROUP BY 
        year, month
    ORDER BY 
        year, month;
    """
    cursor.execute(linechart_query)
    rows = cursor.fetchall()
    cursor.close()
    mydb.close()
    months = []
    total_sales = []
    total_profit = []

    for i, row in enumerate(rows):
        months.append(row[1])
        total_sales.append(row[2])
        total_profit.append(row[5])

    data = {"xAxis":{"id":"months", "label": "months", "data": months}, "yAxis": {"sales": {"id": "Sales", "label": "Sales", "data": total_sales}, "profit":{"id": "Profit", "label": "Profit", "data": total_profit}}}
    return jsonify(data)

@app.route('/payment_method', methods=['GET'])
@cross_origin(origin='*',headers=['Content-Type'])
def get_payment_method():
    mydb = mysql.connector.connect(**sql_config)
    cursor = mydb.cursor()

    cursor.execute("Select payment_method, COUNT(payment_method) from sampled_data GROUP BY payment_method;")
    rows = cursor.fetchall()
    cursor.close()
    mydb.close()

    methods = []
    total_payment = []
    for i, row in enumerate(rows):
        methods.append(row[0])
        total_payment.append(row[1])
    return jsonify({'data': total_payment, 'label': methods})

@app.route('/get_top_result', methods=['GET'])
@cross_origin(origin='*',headers=['Content-Type'])
def get_top_results():
    mydb = mysql.connector.connect(**sql_config)
    cursor = mydb.cursor()
    top_product_query = """
        SELECT Product, SUM(Profit) as Profit
        FROM sampled_data
        GROUP BY Product
        ORDER BY Profit DESC LIMIT 3;
    """
    top_age_query = """
        SELECT Aging, SUM(Profit) as Profit
        FROM sampled_data
        GROUP BY Aging
        ORDER BY Profit DESC Limit 3;
    """
    cursor.execute(top_product_query)
    rows = cursor.fetchall()
    product_label = []
    product_dataset = []
    for i, row in enumerate(rows):
        product_label.append(row[0])
        product_dataset.append(row[1])

    cursor.execute(top_age_query)
    rows = cursor.fetchall()
    age_label = []
    age_dataset = []
    for i, row in enumerate(rows):
        age_label.append(row[0])
        age_dataset.append(row[1])

    cursor.close()
    mydb.close()

    return jsonify({'top_product': {'data': product_dataset, 'label' : product_label}, 'top_age':{'data': age_dataset, 'label' : age_label}})

@app.route('/model_details', methods=['GET'])
@cross_origin(origin='*',headers=['Content-Type'])
def get_model_details():
    mydb = mysql.connector.connect(**sql_config)
    cursor = mydb.cursor()
    model_id = 5
    model_details_query = "SELECT mae, mse, rmse, r, r_square, predicted_column, model_id FROM models WHERE model_id = %s;"
    cursor.execute(model_details_query, (model_id,))
    model_details = cursor.fetchone()
    cursor.close()
    mydb.close()

    if model_details:
        return jsonify({"mae": model_details[0], "mse": model_details[1], "rmse": model_details[2], "r": model_details[3], "r2":model_details[4], "predicted_column":model_details[5], "model_id": model_details[6]})
    else:
        return jsonify({'error': 'No data found for the specified model_id.'}), 40

@app.route('/table_data', methods=['GET'])
@cross_origin(origin='*',headers=['Content-Type'])
def get_table_data():
    mydb = mysql.connector.connect(**sql_config)
    cursor = mydb.cursor()
    model_id = 5
    model_details_query = "SELECT table_name FROM models WHERE model_id = %s;"
    cursor.execute(model_details_query, (model_id,))
    result = cursor.fetchone()

    cursor.execute(f"SELECT * FROM {result[0]}")
    data_list = cursor.fetchall()
    field_names = [i[0] for i in cursor.description]
    field_types = [FieldType.get_info(i[1]) for i in cursor.description]

    cursor.close()
    mydb.close()
    formatted_data_list = []
    for row in data_list:
        row_dict = {}
        for index, value in enumerate(row):
            field_name = field_names[index]
            formatted_value = value
            if isinstance(value, datetime.date):
                formatted_value = value.strftime('%Y-%m-%d')
            elif isinstance(value, datetime.timedelta):
                formatted_value = str(value)
            row_dict[field_name] = formatted_value
        formatted_data_list.append(row_dict)
    data = {
        "data": formatted_data_list,
        "header": {'field_names': field_names, 'field_type': field_types}
    }
    return jsonify(data)

app.run(host='localhost', port=5000)