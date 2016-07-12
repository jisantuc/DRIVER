Blackspot Model
===============

This directory contains the `blackspot_model.R` script, which uses gradient boosted regression trees to predict severe and non-severe crashes in traffic segments based on location, geography, and historical severe and non-severe crashes.

## Modeling

This section explains inputs and outputs of the blackspots model. The blackspots model ingests the data below and predicts crashes in road segments.

### Input Variables

Each of the variables in the following list must be included in an input csv for the model to be able to run. Below, a "segment" refers to a section of road or an intersection and "present" refers to the final year of training data.

- `inter`: (binary) whether a segment contains an intersection
- `length`: (float) the length of a segment in meters (???? coordinates dependent?)
- `lines`: (integer) the number of line segments comprising the traffic segment in which the crash occurred. All segments with more than one line contain an intersection.
- `pointx`: (float) the x coordinate of the centroid of the segment, in ????
- `pointy`: (float) the y coordinate of the centroid of the segment, in ????
- `t0notsev`: (integer) the number of non-severe crashes in the segment in `t0`, where `t0` is the current period, extending from a year ago to the present
- `t0sev`: (integer) the number of severe crashes in the segment in `t0`
- `tXXnotsev`: (integer) the number of non-severe crashes in the segment in `tXX`, where `tXX` is the period spanning from `XX` years before the present to one year before that. For example, `t1` includes from two years before the present to one year before the present.
- `tXXsev`: (integer) the number of severe crashes in the segment in `tXX`

For `tXXnotsev` and `tXXsev`, the script will by default look for variables matching from `t3` to `t1` for training and will look for a `t0` or `t1` for results. This behavior can be modified in the `PrepData` function.

### Outcome Variables

The outcome variable can be set by the user in the `PrepData` function of the included script. If the user sets `outcome.year` to `0`, the model will be trained and tested on the same year's data. If the user sets `outcome.year` to `-1`, the model will forecast future data.

While the outcomes themselves --- numbers of crashes of different types --- are counts, the forecasts themselves will be floating point values.

## How the Model Works

This section explains the basics of decision trees and boosted decision trees.

### Decision Trees

Decision trees are series of if-then statements that govern predictions about something we'd like to know about. For example, we might [want to predict](http://www.r2d3.us/visual-intro-to-machine-learning-part-1/) whether a home is in San Francisco or New York based on its price per square foot, its altitude, its number of bedrooms, etc. Decision trees accomplish this by finding rules based on the data we have to minimize some loss function.

For example, consider the following data, and suppose we want to minimize the total variance across groups in `y` after each split in `x` (we're only allowed to make one split at a time):

   y     x
---- -----
   1   0
   2   1
   3   3
   1   1
   2   1
   7   4.1
   8  12
   9  19
   7   8
   7   1

Splitting the above table at `x > 3` results in the lowest total variance in the two groups; the group with `x` values greater than 3 includes 7, 8, 9, and 7, while the group with `x` values less than or equal to three includes 1, 2, 3, 1, 2, and 7. Our decision tree at this point would guess the mean for each of these groups -- 7.75 for the `x > 3` group and 2.67 for the `x <= 3` group. After this split, our tree has a depth of 1.

With the toy data above, total variance is already pretty low, but we could find another split within each of our groups to decrease total variance further. If we split one more time, our tree depth would be 2. As we increase depth by a level at a time, we both increase our predictive accuracy and more closely link our predictions to the particular sample of data that we've drawn.

### Boosting

When we _boost_ a tree, we successively fit many trees.

With the predictions from our simple tree above, it's easy to calculate the error, shown in the table below:

     y     x
------ -----
 -1.67   0
 -0.67   1
  0.33   3
 -1.67   1
 -0.67   1
 -0.75   4.1
  0.25  12
  1.25  19
 -0.75   8
  4.33   1

Without needing to know where those errors came from, we could fit _another_ tree to explain those errors --- the errors from one tree become the target of the next tree. Each tree improves slightly on the previous tree. In sequence, what each tree provides is a better prediction of the errors from the previous tree. For additional information on boosted trees:

- This blog post includes helpful animations of improving trees in successive rounds: <http://freakonometrics.hypotheses.org/19874>
- These slides with a mathematical treatment include a helpful "model improvement game" starting on slide 11: <http://www.ccs.neu.edu/home/vip/teach/MLcourse/4_boosting/slides/gradient_boosting.pdf>
