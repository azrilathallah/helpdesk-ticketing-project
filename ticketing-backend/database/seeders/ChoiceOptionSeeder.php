<?php

namespace Database\Seeders;

use App\Models\ChoiceGroup;
use App\Models\ChoiceOption;
use Illuminate\Database\Seeder;

class ChoiceOptionSeeder extends Seeder
{
    public function run(): void
    {
        $groups = [
            'material_group' => [
                'label' => 'Material - Material Group',
                'options' => [
                    ['S1100', 'Office Equipment'],
                    ['S1101', 'Office Stationary'],
                    ['S1200', 'IT Software'],
                    ['S1201', 'IT Hardware'],
                    ['S1300', 'Vehicle'],
                    ['S1400', 'Rental for General'],
                    ['S1500', 'Commercial'],
                    ['S1600', 'Consultant'],
                    ['S1700', 'Service for General'],
                    ['S1800', 'Membership'],
                    ['S2000', 'Network Equipment'],
                    ['S2001', 'PM (Preventive Maintenance'],
                    ['S2100', 'CM (Corrective Maintenance'],
                    ['S2101', 'Building'],
                    ['S2200', 'Land'],
                    ['S2201', 'Medical'],
                    ['S2300', 'Training'],
                    ['S2400', 'Pers & PR'],
                    ['S2500', 'Tower Acquisition'],
                    ['S2600', 'SITAC 1 & 2'],
                    ['S2800', 'CME/Implementation'],
                    ['S2900', 'Fabrication'],
                    ['S3000', 'Camouflage'],
                    ['S3100', 'Mobilization/Delivery'],
                    ['S3200', 'Strenghthening'],
                    ['S3300', 'Installation'],
                    ['S3400', 'Dismantle'],
                    ['S3500', 'FO Equipment'],
                    ['S3600', 'Comm Case'],
                    ['S3700', 'Rental CLient Site'],
                    ['S3800', 'Electricity - Non General'],
                    ['S3900', 'Panel & Shelter (Material)'],
                    ['S4000', 'Enclosure (Material)'],
                ],
            ],
            'material_division' => [
                'label' => 'Material - Division',
                'options' => [
                    ['00', 'Cross Division'],
                    ['01', 'Build-To-Suit/Collo'],
                    ['02', 'Fiber Optic'],
                    ['03', 'Property Land'],
                    ['04', 'MBTS'],
                    ['05', 'ISP'],
                ],
            ],
            'material_genitemcatgroup' => [
                'label' => 'Material - GenItemCatGroup',
                'options' => [['LEIS', 'Service w/o Delivery']],
            ],
            'material_tax' => [
                'label' => 'Material - Tax',
                'options' => [['0', 'No Tax'], ['1', 'Full Tax']],
            ],
            'material_matl_statis_group' => [
                'label' => 'Material - Matl Statis Group',
                'options' => [['1', 'Standard']],
            ],
            'material_acc_assignement_group' => [
                'label' => 'Material - Acc Assignement Group',
                'options' => [
                    ['W1', 'Management'],
                    ['W2', 'Space Rental'],
                    ['W3', 'Tools Rental'],
                    ['Y0', 'Postage'],
                    ['Y1', 'In-Building Coverage'],
                    ['Y2', 'Electricity'],
                    ['Y3', 'WIFI offload'],
                    ['Y4', 'WIFI Bandwidth'],
                    ['Y5', 'WIFI E. Advertising'],
                    ['Y6', 'WIFI I. Pass'],
                    ['Y7', 'WIFI Andro-Prepaid'],
                    ['Y8', 'Retail (Building & Non)'],
                    ['Y9', 'Service NetSnapper'],
                    ['YA', 'Managed Service IBC'],
                    ['YB', 'Managed Service WIFI'],
                    ['YC', 'Open Net'],
                    ['YD', 'IBS Macro'],
                ],
            ],
        ];

        foreach ($groups as $key => $groupData) {
            $group = ChoiceGroup::where('key', $key)->first();

            // Lewati jika choice group belum tersedia.
            if (!$group) {
                continue;
            }

            foreach ($groupData['options'] as $index => [$value, $label]) {
                ChoiceOption::firstOrCreate(
                    [
                        'choice_group_id' => $group->id,
                        'value' => $value,
                    ],
                    [
                        'label' => $label,  
                        'sort_order' => $index + 1,
                        'start_date' => null,
                        'end_date' => null,
                    ]
                );
            }
        }
    }
}
