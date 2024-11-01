# BYU Sports Apps

A few sports apps to help the BYU sports fanatics.

## Big XII Championship Tie Breaker Simulator

The [/simulator](https://sports.braydonjones.com/simulator) path shows the Big XII standings simulator app. This app codifies the [Big XII tie breaker rules](https://big12sports.com/documents/2024/9/5/Big_12_Football_2024_Tiebreaker_Policy.pdf) and allows the users to run through different scenarios to see who would make it to the Big XII title game.

I followed an interpretation of the rules laid out in the podcast in [this](https://www.si.com/college/byu/football/what-does-byu--record-need-to-be-to-make-the-big-12-championship) article.

### Simulations

Some hard coded simulations can be found in [run-simulation.ts](/lib/standings/run-simulation.ts) with the ability to run these methods in [run-simulation.spec.ts](/lib/standings/run-simulations.spec.ts).

In the future the ability to select different simulations from the UI will be incorporated.

### Simulation Results

The following are the number of scenarios where BYU makes the Big XII Championship based on the possible permutations for the top 6 championship contending teams (with at most 2 loses).

<table>
  <tr>
    <th>Losses</th>
    <th>Num. Top 2 Scenarios</th>
    <th>Num. Total Scenarios</th>
    <th>Percentage</th>
  <tr>
  <tbody>
    <tr>
        <td>0 losses</td>
        <td>3510</td>
        <td>3510</td>
        <td>100%</td>
    </tr>
    <tr>
        <td>1 loss</td>
        <td>13840</td>
        <td>14040</td>
        <td>98.58%</td>
    </tr>
    <tr>
        <td>2 losses</td>
        <td>9339</td>
        <td>21060</td>
        <td>44.34%</td>
    </tr>
    <tr>
        <td>Combined</td>
        <td>26689</td>
        <td>38610</td>
        <td>69.12%</td>
    </tr>
  </tbody>
</table>
