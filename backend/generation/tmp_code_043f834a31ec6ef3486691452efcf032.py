import yfinance as yf
import pandas as pd
import matplotlib.pyplot as plt

# Get the stock data
stock = yf.Ticker("SPY")
data = stock.history(start="2023-01-01", end="2024-11-17")

# Calculate the moving averages and standard deviations
data['20 Day MA'] = data['Close'].rolling(window=20).mean()
data['20 Day STD'] = data['Close'].rolling(window=20).std()

# Calculate the Bollinger Bands
data['Upper BB'] = data['20 Day MA'] + 2*data['20 Day STD']
data['Lower BB'] = data['20 Day MA'] - 2*data['20 Day STD']

# Create a new column to store the trading signals
data['Signal'] = 0.0

# Generate the trading signals
data.loc[data['Close'] < data['Lower BB'], 'Signal'] = 1.0
data.loc[data['Close'] > data['Upper BB'], 'Signal'] = -1.0

# Plot the stock price and the Bollinger Bands
plt.figure(figsize=(12,6))
plt.plot(data['Close'], label='Close Price')
plt.plot(data['20 Day MA'], label='20 Day MA')
plt.plot(data['Upper BB'], label='Upper BB')
plt.plot(data['Lower BB'], label='Lower BB')

# Plot the trading signals
plt.plot(data[data['Signal'] == 1.0].index, data[data['Signal'] == 1.0]['Close'], label='Buy Signal', marker='^', markersize=10, color='g')
plt.plot(data[data['Signal'] == -1.0].index, data[data['Signal'] == -1.0]['Close'], label='Sell Signal', marker='v', markersize=10, color='r')

# Set the title and labels
plt.title('SPY Stock Price with Bollinger Bands and Trading Signals')
plt.xlabel('Date')
plt.ylabel('Price')
plt.legend(loc='upper left')

# Save the plot
plt.savefig('output.png')

# Calculate the performance of the trading strategy
buy_and_hold_return = (data['Close'].iloc[-1] - data['Close'].iloc[0]) / data['Close'].iloc[0]
trading_strategy_return = (data[data['Signal'] == 1.0]['Close'].mean() - data[data['Signal'] == -1.0]['Close'].mean()) / data[data['Signal'] == -1.0]['Close'].mean()

# Print the results
print('Buy and Hold Return:', buy_and_hold_return)
print('Trading Strategy Return:', trading_strategy_return)

# Save the results to a markdown file
with open('output.md', 'w') as f:
    f.write('# Trading Strategy Results\n')
    f.write('## Buy and Hold Return: {}\n'.format(buy_and_hold_return))
    f.write('## Trading Strategy Return: {}\n'.format(trading_strategy_return))
    f.write('\n')
    f.write('```python\n')
    f.write('# Get the stock data\n')
    f.write('stock = yf.Ticker("SPY")\n')
    f.write('data = stock.history(start="2023-01-01", end="2024-11-17")\n')
    f.write('\n')
    f.write('# Calculate the moving averages and standard deviations\n')
    f.write('data[\'20 Day MA\'] = data[\'Close\'].rolling(window=20).mean()\n')
    f.write('data[\'20 Day STD\'] = data[\'Close\'].rolling(window=20).std()\n')
    f.write('\n')
    f.write('# Calculate the Bollinger Bands\n')
    f.write('data[\'Upper BB\'] = data[\'20 Day MA\'] + 2*data[\'20 Day STD\']\n')
    f.write('data[\'Lower BB\'] = data[\'20 Day MA\'] - 2*data[\'20 Day STD\']\n')
    f.write('\n')
    f.write('# Create a new column to store the trading signals\n')
    f.write('data[\'Signal\'] = 0.0\n')
    f.write('\n')
    f.write('# Generate the trading signals\n')
    f.write('data.loc[data[\'Close\'] < data[\'Lower BB\'], \'Signal\'] = 1.0\n')
    f.write('data.loc[data[\'Close\'] > data[\'Upper BB\'], \'Signal\'] = -1.0\n')
    f.write('\n')
    f.write('# Plot the stock price and the Bollinger Bands\n')
    f.write('plt.figure(figsize=(12,6))\n')
    f.write('plt.plot(data[\'Close\'], label=\'Close Price\')\n')
    f.write('plt.plot(data[\'20 Day MA\'], label=\'20 Day MA\')\n')
    f.write('plt.plot(data[\'Upper BB\'], label=\'Upper BB\')\n')
    f.write('plt.plot(data[\'Lower BB\'], label=\'Lower BB\')\n')
    f.write('\n')
    f.write('# Plot the trading signals\n')
    f.write('plt.plot(data[data[\'Signal\'] == 1.0].index, data[data[\'Signal\'] == 1.0][\'Close\'], label=\'Buy Signal\', marker=\'^\', markersize=10, color=\'g\')\n')
    f.write('plt.plot(data[data[\'Signal\'] == -1.0].index, data[data[\'Signal\'] == -1.0][\'Close\'], label=\'Sell Signal\', marker=\'v\', markersize=10, color=\'r\')\n')
    f.write('\n')
    f.write('# Set the title and labels\n')
    f.write('plt.title(\'SPY Stock Price with Bollinger Bands and Trading Signals\')\n')
    f.write('plt.xlabel(\'Date\')\n')
    f.write('plt.ylabel(\'Price\')\n')
    f.write('plt.legend(loc=\'upper left\')\n')
    f.write('\n')
    f.write('# Save the plot\n')
    f.write('plt.savefig(\'output.png\')\n')
    f.write('\n')
    f.write('# Calculate the performance of the trading strategy\n')
    f.write('buy_and_hold_return = (data[\'Close\'].iloc[-1] - data[\'Close\'].iloc[0]) / data[\'Close\'].iloc[0]\n')
    f.write('trading_strategy_return = (data[data[\'Signal\'] == 1.0][\'Close\'].mean() - data[data[\'Signal\'] == -1.0][\'Close\'].mean()) / data[data[\'Signal\'] == -1.0][\'Close\'].mean()\n')
    f.write('\n')
    f.write('# Print the results\n')
    f.write('print(\'Buy and Hold Return:\', buy_and_hold_return)\n')
    f.write('print(\'Trading Strategy Return:\', trading_strategy_return)\n')
    f.write('```\n')