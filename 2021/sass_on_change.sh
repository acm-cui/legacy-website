#!/bin/bash

fswatch scss |
while read -r directory events filename; do
	now=`date`
	printf "%s: Running SASS..." "$now"
	if sass scss/theme.scss &> css/theme.css; then
		printf "done\n"
		printf "%s: Minifying CSS..." "$now"
		if uglifycss css/theme.css > css/theme.min.css; then
			printf "done!\n"
		else
			printf "failed!\n"
		fi
	else
		printf "failed!\n"
	fi
done
