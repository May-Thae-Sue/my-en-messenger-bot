#!/usr/bin/env bash
cd /home/thaesue/smt_se/Data/model8/my-en/tuning/tmp.1
/home/thaesue/smt_se/mosesdecoder/bin/extractor --sctype BLEU --scconfig case:true  --scfile run5.scores.dat --ffile run5.features.dat -r /home/thaesue/smt_se/Data/model8/my-en/tuning/reference.tc.1 -n run5.best100.out.gz
