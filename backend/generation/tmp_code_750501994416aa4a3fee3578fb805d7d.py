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
    f.write(open('trading_strategy.py').read())
    f.write('```\n')